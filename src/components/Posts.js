import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'

import { db } from 'firebase/client'
import { collection, deleteDoc, doc, onSnapshot, setDoc, query, orderBy } from 'firebase/firestore'

import { AppContext } from 'context/AppContext'

import { useSession } from 'next-auth/react'
import Moment from 'react-moment'

import { BiShareAlt } from 'react-icons/bi'
import { BsTrash, BsHeart, BsHeartFill } from 'react-icons/bs'
import { HiDotsHorizontal, HiOutlineChartBar, HiSwitchHorizontal, HiOutlineChat } from 'react-icons/hi'

const Posts = ({ id, post, postPage }) => {
  // Cambiar el estado del like
  const [liked, setLiked] = useState(false)

  // Aumentar el número de likes
  const [likes, setLikes] = useState([])

  // Aumentar el número de comentarios
  const [comments, setComments] = useState([])

  // Traer datos del usuario
  const { data: session } = useSession()

  // Dirigir a la página del tweet
  const router = useRouter()

  // Contexto para abrir la ventana modal
  const [appContext, setAppContext] = useContext(AppContext)

  // Dar like al tweet
  useEffect(
    () =>
      onSnapshot(collection(db, 'posts', id, 'likes'), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  )

  // Cargar comentarios
  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, 'posts', id, 'comments'),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  )

  // Aumentar el número de like

  useEffect(
    () =>
      setLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  )

  // Cuando el usuario le da like, el like es true y el número aumenta, si no el like es false y el número disminuye

  const likePost = async () => {
    liked
      ? await deleteDoc(doc(db, 'posts', id, 'likes', session.user.uid))
      : await setDoc(doc(db, 'posts', id, 'likes', session.user.uid), { username: session.user.name })
  }
  // Open modal
  const openModal = () => {
    setAppContext({
      ...appContext,
      isModalOpen: true,
      post,
      postId: id
    })
  }

  return (
    <>
      <div
        className='p-3 flex cursor-pointer border-b border-gray-700 hover:bg-[#12121380]'
        onClick={() => router.push(`/${id}`)}
      >
        {/* Carga imagen del usuario */}
        {!postPage && (
          <img
            src={post?.userImg}
            alt='Image'
            className='h-11 w-11 rounded-full mr-4'
          />
        )}
        <div className='flex flex-col space-y-2 w-full'>
          <div className={`flex ${!postPage && 'justify-between'}`}>
            <div className='text-[#6e6e6e]'>
              <div className='inline-block group'>
                <h4 className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${!postPage && 'inline-block'}`}>{post?.username}</h4>
                <span className={`text-sm sm:text-[15px] ${!postPage && 'ml-1.5 '}`}>@{post?.tag}</span>
              </div>{' '}
              -{' '}
              <span className='hover:underline text-sm sm:text-[15px]'>
                <Moment fromNow>{post?.createdAt?.toDate()}</Moment>
              </span>
              {/* Coloca el texto que se escribió */}
              {!postPage && (
                <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>{post?.text}</p>
              )}
            </div>
            <div className='icon group flex-shrink-0 ml-auto'>
              <HiDotsHorizontal className='h-5 text-[#6e767d] group-hover:text-[#1d9bf0]' />
            </div>
          </div>
          {postPage && (
            <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>{post?.text}</p>
          )}
          <img
            src={post?.image}
            alt=''
            className='rounded-2xl max-h-[700px] object-cover mr-2'
          />
          <div className={`text-[#6e767d] flex justify-between w-10/12 ${postPage && 'mx-auto'}`}>
            <div
              className='flex items-center space-x-1 group'
              onClick={(e) => {
                e.stopPropagation()
                openModal()
              }}
            >
              <div className='icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10'>
                <HiOutlineChat className='h-5 group-hover:text-[#1d9bf0]' />
              </div>
              {/* Aumenta el número de comentarios y muestra el número */}
              {comments.length > 0 && (
                <span className='group-hover:text-[#1d9bf0] text-sm'>
                  {comments.length}
                </span>
              )}
            </div>
            {/* Cuando el usuario que hiso el post está autenticado, puede eliminar el tweet, si no se mostrará otro ícono */}
            {session.user.uid === post?.id
              ? (
                <div
                  className='flex items-center space-x-1 group'
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteDoc(doc(db, 'posts', id))
                    router.push('/')
                  }}
                >
                  <div className='icon group-hover:bg-red-600/10'>
                    <BsTrash className='h-5 group-hover:text-red-600' />
                  </div>
                </div>
                )
              : (
                <div className='flex items-center space-x-1 group'>
                  <div className='icon group-hover:bg-green-500/10'>
                    <HiSwitchHorizontal className='h-5 group-hover:text-green-500' />
                  </div>
                </div>
                )}

            <div
              className='flex items-center space-x-1 group'
              onClick={(e) => {
                e.stopPropagation()
                // Función de like
                likePost()
              }}
            >
              <div className='icon group-hover:bg-pink-600/10'>
                {/* Cuando el estado del like cambie, se muestra un ícono diferente */}
                {liked
                  ? (
                    <BsHeartFill className='h-5 text-pink-600' />
                    )
                  : (
                    <BsHeart className='h-5 group-hover:text-pink-600' />
                    )}
              </div>
              {/* Una vez se le da like, el estado pasa a true y aumenta un número */}
              {likes.length > 0 && (
                <span
                  className={`group-hover:text-pink-600 text-sm ${
                  liked && 'text-pink-600'
                }`}
                >
                  {/* Se muestra la cantidad de likes */}
                  {likes.length}
                </span>
              )}
            </div>

            <div className='icon group'>
              <BiShareAlt className='h-5 group-hover:text-[#1d9bf0]' />
            </div>
            <div className='icon group'>
              <HiOutlineChartBar className='h-5 group-hover:text-[#1d9bf0]' />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Posts
