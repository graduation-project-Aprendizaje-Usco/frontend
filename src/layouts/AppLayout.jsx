import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext';
import MarcaUsco from '../components/MarcaUsco';
import CargandoPagina from '../components/CargandoPagina';
import { DRAWER_ANCHO } from '../theme/theme';
import { ETIQUETA_ROL, MENU_POR_ROL } from '../routes/navegacion';

const ID_CONTENIDO = 'contenido-principal';
const ID_MENU = 'menu-principal';

/**
 * Estructura común de las pantallas autenticadas:
 *   <header> AppBar con marca, usuario y cerrar sesión
 *   <nav>    menú del rol: Drawer permanente en escritorio (≥ 900 px), temporal en móvil
 *   <main>   contenido de la ruta hija (<Outlet/>)
 * EstudianteLayout, DocenteLayout y AdminLayout solo le pasan el rol.
 */
export default function AppLayout({ rol }) {
  const theme = useTheme();
  const esEscritorio = useMediaQuery(theme.breakpoints.up('md'));
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const rutaAnterior = useRef(pathname);

  const opciones = MENU_POR_ROL[rol] ?? [];
  const nombre = user?.nombres ?? user?.nombre ?? user?.correo ?? 'Usuario';

  // Al cambiar de pantalla, llevar el foco al contenido para que teclado y
  // lector de pantalla empiecen por la nueva página (no en la primera carga).
  useEffect(() => {
    // Se compara con la ruta anterior (y no con un "primera carga") porque en
    // desarrollo StrictMode ejecuta este efecto dos veces al montar.
    if (rutaAnterior.current === pathname) return;
    rutaAnterior.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  const cerrarSesion = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const contenidoMenu = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Espacio bajo el AppBar fijo */}
      <Toolbar />
      <Typography
        variant="overline"
        component="p"
        sx={{ px: 2.5, pt: 2, color: 'text.secondary', fontWeight: 700 }}
      >
        {ETIQUETA_ROL[rol]}
      </Typography>
      <List id={ID_MENU} sx={{ px: 1 }}>
        {opciones.map(({ etiqueta, ruta, icono: Icono, exacta }) => (
          <ListItem key={ruta} disablePadding sx={{ mb: 0.5 }}>
            {/* NavLink agrega aria-current="page" y la clase "active" a la opción actual */}
            <ListItemButton
              component={NavLink}
              to={ruta}
              end={Boolean(exacta)}
              onClick={() => setMenuAbierto(false)}
              sx={{
                borderRadius: 2,
                minHeight: 44,
                color: 'text.primary',
                '& .MuiListItemIcon-root': { color: 'text.secondary', minWidth: 40 },
                '&.active': {
                  bgcolor: 'usco.vino.50',
                  color: 'primary.main',
                  fontWeight: 700,
                  boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <ListItemIcon>
                <Icono aria-hidden="true" />
              </ListItemIcon>
              <ListItemText primary={etiqueta} slotProps={{ primary: { sx: { fontWeight: 'inherit' } } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Typography variant="caption" component="p" sx={{ p: 2, color: 'text.secondary' }}>
        Universidad Surcolombiana · Facultad de Ingeniería
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Enlace "Saltar al contenido": invisible hasta recibir foco con Tab */}
      <Box
        component="a"
        href={`#${ID_CONTENIDO}`}
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        sx={{
          position: 'absolute',
          left: 8,
          top: -100,
          zIndex: theme.zIndex.tooltip + 1,
          bgcolor: 'background.paper',
          color: 'primary.main',
          px: 2,
          py: 1,
          borderRadius: 1,
          fontWeight: 600,
          '&:focus': { top: 8 },
        }}
      >
        Saltar al contenido
      </Box>

      <AppBar
        component="header"
        position="fixed"
        className="fondo-oscuro"
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!esEscritorio && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-controls={ID_MENU}
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <MarcaUsco />

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ textAlign: 'right', minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {nombre}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {ETIQUETA_ROL[rol]}
            </Typography>
          </Box>

          {esEscritorio ? (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LogoutOutlined />}
              onClick={cerrarSesion}
              sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Cerrar sesión
            </Button>
          ) : (
            <Tooltip title="Cerrar sesión">
              <IconButton color="inherit" edge="end" aria-label="Cerrar sesión" onClick={cerrarSesion}>
                <LogoutOutlined />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        aria-label="Menú principal"
        sx={{ width: { md: DRAWER_ANCHO }, flexShrink: { md: 0 } }}
      >
        {esEscritorio ? (
          <Drawer
            variant="permanent"
            open
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_ANCHO, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider' } }}
          >
            {contenidoMenu}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={menuAbierto}
            onClose={() => setMenuAbierto(false)}
            sx={{ '& .MuiDrawer-paper': { width: Math.min(DRAWER_ANCHO, 300), maxWidth: '85vw', boxSizing: 'border-box' } }}
          >
            {contenidoMenu}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        id={ID_CONTENIDO}
        ref={mainRef}
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          minWidth: 0, // evita scroll horizontal cuando el contenido es ancho
          width: { md: `calc(100% - ${DRAWER_ANCHO}px)` },
          p: { xs: 2, sm: 3 },
          '&:focus': { outline: 'none' },
        }}
      >
        <Toolbar />
        {/* Las páginas se cargan bajo demanda: mientras llegan, el menú y la barra siguen visibles. */}
        <Suspense fallback={<CargandoPagina />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
