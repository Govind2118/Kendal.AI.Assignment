"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import EditBlog from '../../components/EditBlog';

const EditBlogPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [blogData, setBlogData] = useState(null);

  return id ? <EditBlog id={id} className="bg-white" /> : <div>Loading...</div>;
};

export default EditBlogPage;
