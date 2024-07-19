import { useRouter } from 'next/navigation';
import { ChevronLeft24Regular, ArrowUpload24Regular, Add16Regular, Delete24Regular } from '@fluentui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import TextareaAutosize from 'react-textarea-autosize';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const EditBlog = ({ id }) => {
    const [elements, setElements] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const elementRefs = useRef([]);
    const optionsRef = useRef(null);
    const [showImageCaptionInput, setShowImageCaptionInput] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [elementToDelete, setElementToDelete] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchBlog = async () => {
                const docRef = doc(db, 'blog', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const blogData = docSnap.data();
                    setElements([
                        { type: 'heading', content: blogData.heading },
                        { type: 'image-caption', content: blogData.imageCaption },
                        ...blogData.elements,
                    ]);
                    setImageUrl(blogData.imageUrl);
                    if (blogData.imageCaption && blogData.imageCaption != '') {
                        setShowImageCaptionInput(true);
                    }
                } else {
                    console.log('No such document!');
                }
            };

            fetchBlog();
        }
    }, [id]);

    const BlogNavBar = () => {
        const router = useRouter();

        const handleBackClick = () => {
            router.back();
        };

        const handleSave = async () => {
            const heading = elements.find(element => element.type === 'heading').content;
            const imageCaption = elements.find(element => element.type === 'image-caption').content;
            const filteredElements = elements.filter(element => !['heading', 'image-caption'].includes(element.type));
            const blog = {
                heading,
                imageCaption,
                imageUrl,
                timestamp: serverTimestamp(),
                elements: filteredElements
            };

            try {
                const docRef = doc(db, 'blog', id);
                await updateDoc(docRef, blog);
                router.push('/');
            } catch (e) {
                console.error('Error updating document: ', e);
            }
        };

        return (
            <div className="absolute w-full h-[105px] left-0 top-0 flex flex-col items-start">
                <div className="flex flex-row justify-between items-center w-full h-[105px] bg-[#F4F4F4] p-8">
                    <div className="flex flex-row items-center gap-3">
                        <ChevronLeft24Regular className="w-6 h-6 cursor-pointer" onClick={handleBackClick} />
                        <span className="text-2xl font-geist-variable">Blog Editor</span>
                    </div>
                    <div className="flex flex-row justify-end items-center gap-3">
                        <button className="flex flex-row justify-center items-center px-6 py-3 bg-white rounded-md">
                            <span className="text-sm font-geist-variable text-[#333333]">Save as Draft</span>
                        </button>
                        <button
                            className="flex flex-row justify-center items-center px-5 py-3 bg-[#86005E] rounded-md shadow-[0px_8px_40px_rgba(255,255,255,0.2),inset_0px_-2px_4px_rgba(0,0,0,0.1)]"
                            onClick={handleSave}
                        >
                            <span className="text-sm font-geist-variable text-white">Publish Blog</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const uniqueFileName = `blogImages/${uuidv4()}.jpg`;
            const storageRef = ref(storage, uniqueFileName);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setImageUrl(url);
        }
    };

    const handleAddElement = (type) => {
        setElements((prevElements) => [...prevElements, { type, content: '' }]);
        setShowOptions(!showOptions);
    };

    const handleElementChange = (index, content) => {
        setElements((prevElements) =>
            prevElements.map((element, i) => (i === index ? { ...element, content } : element))
        );
    };

    const handleDeleteElement = (index) => {
        setElementToDelete(index);
        setIsModalOpen(true);
    };

    const confirmDeleteElement = () => {
        setElements((prevElements) =>
            prevElements.map((element, i) => {
                if (i === elementToDelete && element.type === 'image-caption') {
                    return { ...element, content: '' };
                }
                return i === elementToDelete ? null : element;
            }).filter(element => element !== null)
        );
        setSelectedElement(null);
        setIsModalOpen(false);
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-md shadow-md w-[567px]">
                    <h2 className="text-xl font-semibold mb-4">Are you sure you want to remove this element</h2>
                    <p className="text-gray-600 mb-6">All the contents of the selected element will be deleted.</p>
                    <div className="flex justify-center space-x-35 pb-2">
                        <button
                            onClick={onConfirm}
                            className="w-full py-2 bg-[#86005E] text-white rounded-md"
                        >
                            Yes, remove element
                        </button>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-gray-200 rounded-md"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const WrapperComponent = ({ children }) => {
        const handleClick = () => {
            setSelectedElement(null);
        };

        return (
            <div onClick={handleClick} className="relative w-full h-screen bg-white">
                {children}
            </div>
        );
    };

    const Element = ({ type, content, index }) => {
        const inputRef = useRef(null);
        const [localContent, setLocalContent] = useState(content);

        useEffect(() => {
            elementRefs.current[index] = inputRef.current;
        }, [index]);

        useEffect(() => {
            if (selectedElement === index && inputRef.current) {
                inputRef.current.focus();
            }
        }, [selectedElement, index]);

        const handleContentChange = (e) => {
            const { selectionStart, selectionEnd } = e.target;
            setLocalContent(e.target.value);
            handleElementChange(index, e.target.value, () => {
                inputRef.current.setSelectionRange(selectionStart, selectionEnd);
            });
        };

        return (
            <div
                className={`relative w-full flex items-center ${type === 'image-caption' ? '' : 'mb-6'} ${selectedElement === index ? 'border border-[#E20ABF]' : 'border border-transparent'}`}
                onClick={(e) => {
                    if (type !== 'image-caption' || showImageCaptionInput) {
                        setSelectedElement(index);
                        e.stopPropagation();
                    }
                }}
            >
                {type === 'divider' ? (
                    <div className="flex w-full items-center relative">
                        <div className="w-full border-b border-[rgba(0,0,0,0.2)]"></div>
                        {selectedElement === index && (
                            <Delete24Regular
                                className="absolute w-6 h-6 cursor-pointer text-red-500"
                                style={{ right: '-30px' }}
                                onClick={(e) => {
                                    handleDeleteElement(index);
                                    e.stopPropagation();
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <div className={`flex w-full items-center relative ${(type === 'image-caption' && !showImageCaptionInput) ? 'bg-gray-100' : ''}`}>
                        {type === 'image-caption' ? (
                            showImageCaptionInput ? (
                                <input
                                    onFocus={(e) =>
                                        e.currentTarget.setSelectionRange(
                                            e.currentTarget.value.length,
                                            e.currentTarget.value.length
                                        )
                                    }
                                    ref={inputRef}
                                    type="text"
                                    value={localContent}
                                    onChange={handleContentChange}
                                    className={`w-full bg-transparent outline-none ${selectedElement === index ? 'border-[#E20ABF]' : 'border-transparent'} text-[26px] font-geist-variable ${localContent ? 'text-black' : 'text-[#AAAAAA]'}`}
                                    placeholder="Add an Image caption"
                                />
                            ) : (
                                <button
                                    onClick={() => setShowImageCaptionInput(true)}
                                    className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md ml-auto"
                                >
                                    Add an Image caption
                                </button>
                            )
                        ) : (
                            <TextareaAutosize
                                wrap="hard"
                                ref={inputRef}
                                value={localContent}
                                onChange={handleContentChange}
                                className={`w-full bg-transparent outline-none resize-none overflow-hidden ${selectedElement === index ? 'border-[#E20ABF]' : 'border-transparent'} ${type === 'heading' ? 'font-playfair-display text-[54px] font-normal text-center leading-[55.99px]' : ''} ${type === 'sub-heading' ? 'font-geist-variable text-[32px] font-[600]' : ''} ${type === 'paragraph' ? 'font-geist-variable text-[20px] font-[400]' : ''} ${localContent ? 'text-black' : 'text-[#AAAAAA]'}`}
                                placeholder={
                                    type === 'heading'
                                        ? 'Begin with an interesting heading here'
                                        : type === 'sub-heading'
                                            ? 'Add a subheading'
                                            : type === 'paragraph'
                                                ? 'Start your paragraph here...'
                                                : ''
                                }
                                onFocus={(e) =>
                                    e.currentTarget.setSelectionRange(
                                        e.currentTarget.value.length,
                                        e.currentTarget.value.length
                                    )
                                }
                                minRows={1}
                            />
                        )}
                        {type !== 'heading' && selectedElement === index && (
                            <Delete24Regular
                                className="absolute w-6 h-6 cursor-pointer text-red-500"
                                style={{ right: '-30px' }}
                                onClick={(e) => {
                                    handleDeleteElement(index);
                                    e.stopPropagation();
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    const BlogFrame = () => (
        <div className="relative w-full min-h-screen bg-white flex flex-col items-center">
            <BlogNavBar />
            <div className="mt-36 w-full flex flex-col items-center">
                {elements.map((element, index) => {
                    if (element.type === 'heading') {
                        return (
                            <div key={index} className="w-[740px] mb-8">
                                <Element type={element.type} content={element.content} index={index} />
                            </div>
                        );
                    }
                    return null;
                })}

                <div className="w-[862px] flex flex-col items-start gap-8">
                    <div className="w-[862px] flex flex-col items-start gap-5">
                        <div>
                            <input
                                type="file"
                                id="fileInput"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <label htmlFor="fileInput" className="box-border w-[862px] h-[350px] flex justify-center items-center cursor-pointer">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-6 border-2 border-dashed border-[rgba(0,0,0,0.3)] rounded-[12px]">
                                        <ArrowUpload24Regular className="text-[#44294B] w-[54px] h-[54px]" />
                                        <div className="text-[#44294B] text-[24px] font-[500]">Upload a Hero Image</div>
                                        <div className="text-[#666666] text-[14px] text-center w-[536px]">
                                            You can upload PNG or JPEG Image. Minimum dimensions must be 500px X 500px
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                        <div className="relative w-[862px] h-9 flex flex-row justify-between items-center gap-5">
                            {elements.map((element, index) => {
                                if (element.type === 'image-caption') {
                                    return (
                                        <div key={index} className="relative flex flex-grow bg-white border-b border-gray-400">
                                            <Element type={element.type} content={element.content} index={index} />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>

                <div className="relative w-full flex justify-center mt-8">
                    <div className="w-[900px]">
                        {elements.map((element, index) => {
                            if (element.type !== 'heading' && element.type !== 'image-caption') {
                                return <Element key={index} type={element.type} content={element.content} index={index} />;
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-5 right-5">
                <button
                    className="box-border flex flex-row justify-center items-center p-[17px_32px] gap-[12px] w-[187px] h-[50px] bg-white border border-[rgba(0,0,0,0.1)] shadow-[0px_4px_24px_rgba(0,0,0,0.1)] rounded-[100px]"
                    onClick={toggleOptions}
                >
                    <span className="text-[14px] font-normal text-[#333333]">Add element</span>
                    <Add16Regular className="w-[20px] h-[20px]" />
                </button>
                {showOptions && (
                    <div
                        ref={optionsRef}
                        className="fixed bottom-20 right-20"
                    >
                        <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleAddElement('sub-heading')}
                        >
                            Sub-heading
                        </div>
                        <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleAddElement('paragraph')}
                        >
                            Paragraph
                        </div>
                        <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleAddElement('divider')}
                        >
                            Divider
                        </div>
                    </div>
                )}
            </div>

        </div>
    );


    if (!id || id == '') {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <ClipLoader size={50} color="#123abc" />
                <p className="mt-4 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-white">
            <WrapperComponent>
                <BlogNavBar />
                <BlogFrame />
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmDeleteElement}
                />
            </WrapperComponent>
        </div>
    );
}

export default EditBlog;
