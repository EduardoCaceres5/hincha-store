import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const colors = {
  brand: {
    50: '#E6FFFA',
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#319795',
    600: '#2C7A7B',
    700: '#285E61',
    800: '#234E52',
    900: '#1D4044',
  },
  accent: {
    50: '#FFF5F5',
    100: '#FED7D7',
    200: '#FEB2B2',
    300: '#FC8181',
    400: '#F56565',
    500: '#E53E3E',
    600: '#C53030',
    700: '#9B2C2C',
    800: '#822727',
    900: '#63171B',
  },
}

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
}

const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'teal' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'teal' ? 'brand.600' : undefined,
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      }),
      ghost: {
        _hover: {
          bg: 'blackAlpha.100',
        },
      },
    },
    defaultProps: {
      colorScheme: 'teal',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        overflow: 'hidden',
      },
    },
    variants: {
      elevated: {
        container: {
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
          },
          transition: 'box-shadow 0.2s',
        },
      },
      gradient: {
        container: {
          bgGradient: 'linear(to-br, brand.500, brand.700)',
          color: 'white',
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 3,
      py: 1,
      fontWeight: 'semibold',
      fontSize: 'xs',
      textTransform: 'none',
    },
  },
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'full',
        fontWeight: 'medium',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
      letterSpacing: '-0.02em',
    },
  },
}

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
}

export default extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  components,
  styles,
})
