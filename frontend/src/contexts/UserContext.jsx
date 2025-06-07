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
		role: '', // 'student', 'admin', 'judge', 'teacher'
		ssn: ''
	});

	const [isLoadingUser, setIsLoadingUser] = useState(true); // 用於指示是否正在加載用戶資訊

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
                role: data.role,
				ssn: data.ssn
            });
        } else {
            // 用戶未登入或 token 無效
            setUserInfo({
                isLoggedIn: false,
                username: '',
                role: '',
                ssn: ''
            });
        } 
    } catch (error) {
        console.error('獲取用戶資訊失敗:', error);
        setUserInfo({
            isLoggedIn: false,
            username: '',
            role: '',
			ssn: ''
        });
    } finally {
		setIsLoadingUser(false); // 無論成功或失敗，都設置為已加載
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
				role: '',
				ssn: ''
			});
		} catch (error) {
			console.error('登出失敗:', error);
		}
	};

	const value = {
		userInfo,
		isLoadingUser, // 給外部使用
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