const fetchUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    setUser(null);
    return;
  }

  try {
    const response = await api.get('/auth/me');
    setUser(response.data);
  } catch (error) {
    console.error('Error fetching user:', error);
    // Don't remove token or redirect on fetch user failure
    setUser(null);
  }
}; 