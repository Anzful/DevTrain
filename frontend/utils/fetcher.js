// frontend/utils/fetcher.js
const fetcher = async (url) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found in localStorage');
        throw new Error('No token available');
      }
  
      console.log('Fetching:', url, 'with token:', token);
  
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log('Fetched data:', data);
      return data;
    } catch (error) {
      console.error('Fetcher error:', error);
      throw error;
    }
  };
  
  export default fetcher;
  