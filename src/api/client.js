import axios from 'axios';

export const CLAVE_TOKEN = 'token';
/** Lo escucha AuthContext para cerrar la sesión cuando el backend responde 401. */
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

// En login y registro un 401 significa "credenciales incorrectas", no "sesión vencida".
const RUTAS_SIN_SESION = ['/auth/login', '/auth/registro'];

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && !RUTAS_SIN_SESION.includes(error.config?.url)) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    return Promise.reject(error);
  },
);

export default api;
