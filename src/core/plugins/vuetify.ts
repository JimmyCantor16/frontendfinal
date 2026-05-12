import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { mdiCustomSet, mdiCustomAliases } from './mdi-icons'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: mdiCustomAliases as never,
    sets: { mdi: mdiCustomSet },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#4f46e5',
          'primary-darken-1': '#4338ca',
          secondary: '#1e1b4b',
          accent: '#a5b4fc',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#42b983',
          background: '#f5f5f5',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { rounded: 'lg', elevation: 2 },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VDataTable: { hover: true },
  },
})
