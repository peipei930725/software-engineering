// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// 創建用戶上下文
export const UserContext = createContext();

// 自定義 hook 來使用用戶上下文
export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

// 用戶狀態提供者組件
export const UserProvider = ({ children }) => {
	const [userInfo, setUserInfo] = useState({
		isLoggedIn: false,
		username: '',
		role: '' // 'student', 'admin', 'judge', 'teacher'
	});

	// 從後端獲取用戶資訊的函數
const fetchUserInfo = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/userinfo', {
            method: 'GET',
            credentials: 'include', // 包含 cookies
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            setUserInfo({
                isLoggedIn: true,
                username: data.username,
                role: data.role
            });
        } else {
            // 用戶未登入或 token 無效
            setUserInfo({
                isLoggedIn: false,
                username: '',
                role: ''
            });
        }
    } catch (error) {
        console.error('獲取用戶資訊失敗:', error);
        setUserInfo({
            isLoggedIn: false,
            username: '',
            role: ''
        });
    }
};

// App 初始化時自動檢查登入狀態 ✅✅✅
useEffect(() => {
    fetchUserInfo();
}, []);

	// 登出函數
	const handleLogout = async () => {
		try {
			await fetch('http://localhost:5000/api/logout', {
				method: 'POST',
				credentials: 'include'
			});
			setUserInfo({
				isLoggedIn: false,
				username: '',
				role: ''
			});
		} catch (error) {
			console.error('登出失敗:', error);
		}
	};

	// 組件載入時檢查用戶登入狀態
	// useEffect(() => {
	// 	fetchUserInfo();
	// 	// 測試用
	// 	// setUserInfo({
	// 	// 	isLoggedIn: true,
	// 	//  	username: '王大明', // 測試用戶名
	// 	//  	role: 'admin' // 測試角色
	// 	// });
	// }, []);

	const value = {
		userInfo,
		fetchUserInfo,
		handleLogout,
		setUserInfo // 如果需要直接設置用戶資訊
	};

	return (
		<UserContext.Provider value={value}>
			{children}
		</UserContext.Provider>
	);
};