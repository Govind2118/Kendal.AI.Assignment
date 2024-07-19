import { ChevronDown16Regular } from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';

const Blog = ({ blog }) => {

  const router = useRouter();

  const handleManageClick = (id) => {
    router.push(`/editBlog?id=${id}`);
  };

  const totalContentLength = blog.elements.reduce((total, element) => {
    if (element.type === 'heading' || element.type === 'sub-heading') {
      return total + (element.content ? element.content.length : 0);
    }
    return total;
  }, 0);

  const readingTime = Math.ceil(totalContentLength / 200);

  const now = new Date();
  const publishedDate = new Date(blog.timestamp?.toDate());
  const daysAgo = Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="box-border flex flex-row items-start p-6 gap-7 w-[852px] h-[249px] bg-white border border-[rgba(0,0,0,0.1)] shadow-[0px_0px_20px_rgba(0,0,0,0.05)] rounded-[12px]">
      <div className="w-[201px] h-[201px] bg-white rounded-[7.18px] overflow-hidden">
        <img
          src={blog.imageUrl}
          alt={blog.heading}
          className="w-full h-full object-cover rounded-[7.18px]"
        />
      </div>
      <div className="flex flex-col justify-between items-start p-0 gap-4 w-[575px] h-[201px]">
        <div className="flex flex-col items-start p-0 gap-4 w-[575px] h-[126px]">
          <h2 className="w-[575px] h-[30px] font-['Geist Variable'] font-medium text-[24px] leading-[30px] text-[#222222]">
            {blog.heading}
          </h2>
          <p className="w-[239px] h-[14px] font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#333333]">
            {`Published ${daysAgo} days ago • ${readingTime} minute read`}
          </p>
          <p className="w-[575px] h-[52px] font-['Geist Variable'] font-normal text-[17px] leading-[150%] text-[#666666]">
            {blog.imageCaption}
          </p>
        </div>
        <div className="flex flex-row justify-end items-center p-0 gap-4 w-[575px] h-[46px]">
          <button onClick={() => handleManageClick(blog.id)} className="box-border flex flex-row justify-center items-center p-[15px_24px] gap-1 w-[118px] h-[44px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[6px]">
            <span className="font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#333333]">
              Open Blog
            </span>
          </button>
          <button className="box-border flex flex-row justify-center items-center p-[15px_16px_15px_24px] gap-2 w-[117px] h-[46px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[6px]">
            <span className="w-[53px] h-[14px] font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#333333]">
              Manage
            </span>
            <ChevronDown16Regular primaryFill="#333333" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
