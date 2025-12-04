# ImpactStore 🏪

<div align="center">
  
![ImpactStore Logo](public/LOGO_Marca.png)

**E-commerce Esportivo com Visualização 3D**

[![Angular](https://img.shields.io/badge/Angular-19.2.6-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181.1-black.svg)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-green.svg)](https://greensock.com/)

</div>

## 🎯 Sobre o Projeto

O **ImpactStore** é um projeto de TCC (Trabalho de Conclusão de Curso) que implementa uma loja de e-commerce moderna e interativa, focada em produtos esportivos com integração de experiências visuais 3D. O projeto se destaca pela arquitetura moderna, design responsivo e tecnologias de ponta.

### ✨ Características Principais

- 🎮 **Visualização 3D** interativa de produtos com Three.js
- 📱 **Design Responsivo** mobile-first
- ⚡ **Performance Otimizada** com lazy loading
- 🔐 **Sistema de Autenticação** completo
- 🛒 **E-commerce Funcional** com carrinho e pedidos
- 🎨 **Design Moderno** com animações GSAP
- 🧩 **Arquitetura Modular** Angular 19

## 🚀 Tecnologias

| Categoria       | Tecnologia    | Versão  |
| --------------- | ------------- | ------- |
| **Framework**   | Angular       | 19.2.6  |
| **Linguagem**   | TypeScript    | 5.7.2   |
| **3D Graphics** | Three.js      | 0.181.1 |
| **Animações**   | GSAP          | 3.13.0  |
| **Styling**     | SCSS          | -       |
| **Testing**     | Jasmine/Karma | -       |

### 📦 Pacotes Principais

- **three**: "^0.181.1" - Renderização 3D
- **@types/three**: "^0.181.0" - Tipos TypeScript para Three.js
- **gsap**: "^3.13.0" - Animações

## 📦 Funcionalidades

### ✅ **Implementadas**

- 🏠 Página principal com carrossel de produtos
- 🔐 Sistema de login/registro
- 🛒 Carrinho de compras funcional
- 📦 Catálogo de produtos com filtros
- 📋 Sistema de pedidos completo
- 👤 Perfis de usuário
- 📱 Interface responsiva

## 🛠️ Instalação

### Pré-requisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Passo a passo

```bash
# 1. Clonar repositório
git clone https://github.com/usuario/impact-store.git
cd impact-store

# 2. Instalar dependências
npm install

# 3. Executar testes (opcional)
npm test
```

### Comandos Disponíveis

```bash
npm run build          # Build para produção
npm run build:vercel   # Build otimizado para Vercel
npm test               # Executar testes
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/        # 18+ componentes UI
│   │   ├── home/          # Página principal
│   │   ├── products/      # Catálogo de produtos
│   │   ├── cart/          # Carrinho de compras
│   │   ├── three-viewer/  # Visualizador 3D
│   │   └── ...            # Outros componentes
│   ├── services/          # Lógica de negócio
│   │   ├── products.service.ts
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   └── core/              # Configurações centrais
├── assets/
│   ├── Modelos_3D/       # Modelos GLB para Three.js
│   ├── products.json     # Dados dos produtos
│   └── design-tokens.json # Design system
└── environments/         # Configurações de ambiente
```

## 🎨 Design System

### Cores Principais

```css
--color-bg: #0b0b0c          /* Fundo principal */
--color-surface: #1a1a1c     /* Superfícies */
--color-text: #ffffff        /* Texto principal */
--gradient-accent: linear-gradient(90deg, #ff6a00, #ff2d7a, #7d3cff)
```

### Características

- **Dark Theme**: Interface moderna com tema escuro
- **Gradientes Vibrantes**: Elementos de destaque com cores dinâmicas
- **Animações Fluidas**: Transições suaves com GSAP
- **Mobile-First**: Design responsivo priorizando dispositivos móveis

## 📊 Status do Projeto

- ✅ **Estrutura Base**: Completa
- ✅ **Componentes UI**: Completa
- ✅ **Serviços**: Completa
- ✅ **E-commerce Core**: Funcional

## 🌐 Deploy

### Vercel (Recomendado)

```bash
# Deploy automático configurado
npm run build:vercel
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusuario%2Fimpact-store)

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm test -- --code-coverage

# Tests watch mode
npm run test:watch
```

## 📚 Documentação

Para documentação técnica completa, consulte:

- 📄 [Documentação Principal](PROJECT_DOCUMENTATION.md) - Guia técnico completo
- ⚡ [Quick Reference](QUICK_REFERENCE.md) - Referência rápida para desenvolvedores

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido como **TCC (Trabalho de Conclusão de Curso)** e está disponível para fins educacionais.

## 👨‍💻 Desenvolvido por

**Seu Nome** - Desenvolvimento Completo  
🔗 [LinkedIn](https://linkedin.com/in/jadsonyan/)

---

<div align="center">
  
**⭐ Se este projeto foi útil, considere dar uma estrela! ⭐**

_Desenvolvido com ❤️ para o TCC 2025_

</div>
