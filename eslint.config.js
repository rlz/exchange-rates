import stylistic from '@stylistic/eslint-plugin'
import parser from '@typescript-eslint/parser'

export default [
    {
        files: [
            'src/**/*.@(ts|tsx|js|jsx)',
            'scripts/**/*.ts',
            'vite.config.ts'
        ],
        languageOptions: {
            parser
        }
    },
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: false,
        jsx: true,
        commaDangle: 'never'
    })
]
