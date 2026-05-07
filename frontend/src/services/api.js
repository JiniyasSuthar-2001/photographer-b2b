import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to headers
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (username, password) => {
        const response = await apiClient.post('/auth/login', { username, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    signup: async (username, password) => {
        const response = await apiClient.post('/auth/signup', { username, password });
        return response.data;
    },
    forgotPassword: async (username) => {
        const response = await apiClient.post('/auth/forgot-password', { username });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const notificationService = {
    getNotifications: async (page = 1, limit = 20) => {
        const response = await apiClient.get(`/notifications/?page=${page}&limit=${limit}`);
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data;
    }
};

export const jobService = {
    getJobs: async () => {
        const response = await apiClient.get('/jobs/');
        return response.data;
    },
    createJob: async (data) => {
        const response = await apiClient.post('/jobs/', data);
        return response.data;
    }
};

export const requestService = {
    getRequests: async ({ role = 'receiver', status } = {}) => {
        const params = new URLSearchParams({ role });
        if (status) params.set('status', status);
        const response = await apiClient.get(`/requests/?${params.toString()}`);
        return response.data;
    },
    getInvites: async () => {
        const response = await apiClient.get('/requests/?role=receiver&status=pending');
        return response.data;
    },
    getDeclinedInvites: async () => {
        const response = await apiClient.get('/requests/?role=receiver&status=declined');
        return response.data;
    },
    getAcceptedJobs: async () => {
        const response = await apiClient.get('/requests/accepted-jobs');
        return response.data;
    },
    sendRequest: async (data) => {
        const response = await apiClient.post('/requests/', data);
        return response.data;
    },
    respondToRequest: async (id, status) => {
        const response = await apiClient.patch(`/requests/${id}?status=${status}`);
        return response.data;
    }
};

export const teamService = {
    getTeam: async () => {
        const response = await apiClient.get('/team/');
        return response.data;
    },
    getCollaborations: async (memberId, page = 1) => {
        const response = await apiClient.get(`/team/collaborations/${memberId}?page=${page}&limit=10`);
        return response.data;
    }
};

export const dashboardService = {
    getMyJobs: jobService.getJobs,
    getInvites: requestService.getInvites,
    getAcceptedJobs: requestService.getAcceptedJobs,
};

export const analyticsService = {
    getTopPhotographers: async () => {
        const response = await apiClient.get('/team/top-photographers');
        return response.data;
    }
};

export default apiClient;
