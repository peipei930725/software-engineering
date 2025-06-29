import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="bg-[#023047] flex items-center justify-center h-screen w-screen">
            <div className="flex-col">
                <h1 className="text-4xl font-bold mb-6">404 - 找不到網頁!</h1>
                <Link to="/">
                    <button className='text-white'>回到首頁</button>
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage