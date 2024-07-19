"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase';
import Blog from '../components/Blog';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Add16Regular } from '@fluentui/react-icons';

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogsCollection = collection(db, 'blog');
      const blogsSnapshot = await getDocs(blogsCollection);
      const blogsList = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogs(blogsList);
    };

    const fetchBackgroundImage = async () => {
      const storage = getStorage();
      const storageRef = ref(storage, 'backgrounds/backgroundImage.jpg');
      try {
        const url = await getDownloadURL(storageRef);
        setBackgroundUrl(url);
      } catch (error) {
        console.error('Error fetching background image:', error);
      }
    };

    fetchBlogs();
    fetchBackgroundImage();
  }, []);

  const Navigation = () => {
    return (
      <div className="flex flex-row justify-between items-center p-4 gap-[994px] fixed w-full h-[106px] top-0 bg-[#F4F4F4] z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-[60px]" />
        </div>
        <div className="flex items-center space-x-8">
          <a href="#" className="text-black">Home</a>
          <a href="#" className="text-black">About</a>
          <a href="#" className="text-black">Listings</a>
          <a href="#" className="text-black">FAQ</a>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">Contact us</button>
        </div>
      </div>
    );
  };

  const handleCreateNewBlog = () => {
    router.push('/createBlog');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(file);
      const storage = getStorage();
      const storageRef = ref(storage, 'backgrounds/backgroundImage.jpg');

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setBackgroundUrl(url);
    }
  };

  const MainLayout = () => {
    const openFilePicker = () => {
      document.getElementById('fileInput').click();
    };

    return (
      <div className="relative w-full h-[662px] left-[-1px] top-[106px] drop-shadow-md z-10">
        {backgroundUrl ? (
          <div
            className="absolute w-full h-[878px] left-0 top-[-120px] blur-[12px]"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
            }}
          ></div>
        ) : (
          <div className="absolute w-full h-[878px] left-0 top-[-120px] bg-[#888888] blur-[12px]"></div>
        )}

        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />

        {!backgroundUrl && (
          <button
            onClick={openFilePicker}
            className="absolute flex items-center justify-center p-[15px_20px_15px_24px] w-[221px] h-[49px] right-[24.72px] top-[24.19px] bg-white rounded-[6px]"
          >
            <div className="text-[16px] font-[400] text-[#222222]">
              Add a blog background
            </div>
          </button>
        )}

        <div className="absolute w-[786px] h-[72px] left-[106px] top-[calc(50%-36px-145px)] font-playfair-display font-semibold text-[54px] leading-[72px] text-white">
          Investor Daily Dubai
        </div>

        <div className="absolute w-[862px] h-[34px] left-[106px] top-[246px] font-['Geist Variable'] font-normal text-[20px] leading-[170%] text-[#F4F4F4]">
          A blog sharing the daily updates in Dubai Real Estate and Investment markets.
        </div>

        <button
          onClick={handleCreateNewBlog}
          className="absolute flex flex-row justify-center items-center p-[15px_20px_15px_24px] gap-[6px] w-[177px] h-[50px] left-[106px] top-[325px] bg-white rounded-[100px] focus:outline-none"
        >
          <div className="text-[14px] font-['Geist Variable'] font-normal text-[#333333]">
            Create new blog
          </div>
          <Add16Regular primaryFill="#333333" className="w-[20px] h-[20px]" />
        </button>

        <div className="absolute flex flex-row justify-center items-center p-[15px_20px_15px_24px] gap-[6px] w-[233px] h-[51px] left-[294px] top-[325px] bg-white rounded-[100px]">
          <div className="text-[14px] font-['Geist Variable'] font-normal text-[#333333]">
            Manage Subscribers
          </div>
          <div className="text-[14px] font-['Geist Variable'] font-normal text-[#999999]">
            • 12.3K
          </div>
        </div>
      </div>
    );
  };

  const BlogView = () => {
    return (
      <div className="absolute top-[768px] left-0 right-0 flex justify-center z-30">

        {blogs.length > 0 ? (
          <div className="relative w-full bg-white pb-[100px] flex justify-center">
            <div className="flex flex-col items-start p-0 gap-[24px] w-[852px] pb-[100px]">
              <div></div>
              {blogs.map(blog => (
                <Blog key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[400px] bg-white">
            <div className="absolute w-full flex flex-col justify-center items-center top-[30px]">
              <div className="box-border flex flex-col justify-center items-center p-[42px_200px] gap-6 w-[1367px] h-[182px] border border-[rgba(0,0,0,0.2)] rounded-[24px] bg-white">
                <div className="text-[24px] font-[400]">
                  Start with your first blog!
                </div>
                <button
                  onClick={handleCreateNewBlog}
                  className="flex flex-row justify-center items-center p-[15px_20px_15px_24px] gap-[6px] w-[192px] h-[50px] bg-[#F4F4F4] shadow-[0px_0px_40px_rgba(255,255,255,0.2),inset_0px_-2px_4px_rgba(0,0,0,0.1)] rounded-[100px]"
                >
                  <div className="flex-none order-0 flex-grow-0 w-[122px] h-[16px] font-['Geist Variable'] font-normal text-[16px] leading-[100%] text-[#333333]">
                    Create new blog
                  </div>
                  <div className="flex-none order-1 flex-grow-0 w-[20px] h-[20px] flex items-center justify-center">
                    <Add16Regular primaryFill="#333333" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };


  return (
    <div className="relative font-geist-variable">
      <Navigation />
      <MainLayout />
      <BlogView />
    </div>
  )
}

export default HomePage;
