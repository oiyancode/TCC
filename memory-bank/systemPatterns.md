# Padrões de Sistema - BlueHouse Store

## Arquitetura Geral

### Padrão Arquitetural

**Single Page Application (SPA)** com arquitetura baseada em componentes Angular, seguindo o padrão **Component-Based Architecture** com lazy loading para otimização de performance.

### Estrutura de Módulos

```
src/app/
├── components/           # Componentes reutilizáveis
│   ├── home/            # Página inicial
│   ├── product-card/    # Card de produto
│   ├── product-details/ # Detalhes do produto
│   ├── navbar/          # Barra de navegação
│   ├── news/           # Seção de notícias
│   ├── hero/           # Seção hero
│   └── three-viewer/   # Visualizador 3D
├── services/           # Serviços de dados
│   └── products.service.ts
└── assets/            # Recursos estáticos
    ├── products.json
    └── Modelos_3D/    # Modelos GLB para Three.js
```

## Padrões de Design Implementados

### 1. **Component Pattern**

- **Separação de Responsabilidades**: Cada componente tem uma função específica
- **Reutilização**: Components como `product-card` são reutilizáveis
- **Encapsulamento**: Lógica, template e estilo encapsulados

### 2. **Service Pattern**

- **ProductsService**: Centraliza acesso aos dados de produtos
- **HTTP Client**: Integração com APIs RESTful
- **Observable Pattern**: RxJS para programação reativa

### 3. **Lazy Loading Pattern**

- **Route-based Code Splitting**: Componentes carregados sob demanda
- **Otimização**: Redução do bundle inicial
- **Performance**: Carregamento mais rápido da aplicação

### 4. **Repository Pattern**

- **Products.json**: Fonte única de verdade para produtos
- **Service Layer**: Abstração entre UI e dados
- **Interface**: ProductsService como interface padronizada

## Fluxos de Dados

### 1. **Data Flow Principal**

```
HomeComponent → ProductsService → products.json
                    ↓
             ProductCardComponent (reutilizável)
```

### 2. **Navegação**

```
Router → ['', 'product/:id']
    ↓
ProductDetailsComponent → ProductsService → products.json
```

### 3. **3D Rendering Flow**

```
ThreeViewerComponent → Three.js → GLB Models → WebGL Canvas
                        ↓
                   User Interactions (rotation, zoom)
```

## Integração 3D

### Padrões de Renderização

- **Scene Management**: Gerenciamento centralizado de cenas Three.js
- **Model Loading**: Carregamento assíncrono de modelos GLB
- **Resource Optimization**: Otimização de recursos 3D para web

### Componente three-viewer

- **Isolamento 3D**: Lógica 3D separada da aplicação principal
- **Event Handling**: Interações do usuário (mouse, touch)
- **Performance Monitoring**: Otimização de frame rate

## Roteamento e Navegação

### Estrutura de Rotas

```typescript
{
  path: '', // Home
  loadComponent: () => import('./components/home/home.component')
},
{
  path: 'product/:id', // Detalhes do produto
  loadComponent: () => import('./components/product-details/product-details.component')
}
```

### Lazy Loading Benefits

- **Código Splitting**: Cada rota carrega seu código independente
- **SEO**: Melhor indexação de páginas
- **UX**: Navegação mais fluida

## Gerenciamento de Estado

### Padrão Current (Simples)

- **Service-based**: Estados gerenciados via Services
- **HTTP Caching**: Cache em memória de produtos
- **Local State**: Estados locais nos componentes

### Considerações Futuras

- **NgRx**: Possível implementação para gerenciamento de estado complexo
- **State Management**: Centralização de estado global quando necessário

## Componentes Principais

### HomeComponent

- **Responsabilidade**: Página inicial e exibição de produtos
- **Padrão**: Container component
- **Dados**: Consome ProductsService

### ProductCardComponent

- **Responsabilidade**: Exibição individual de produtos
- **Padrão**: Presentational component
- **Reutilização**: Usado em home e potencialmente em outras páginas

### ProductDetailsComponent

- **Responsabilidade**: Visualização detalhada de produto específico
- **Padrão**: Feature component com router param
- **3D Integration**: Pode usar ThreeViewerComponent

### ThreeViewerComponent

- **Responsabilidade**: Renderização 3D de modelos
- **Padrão**: Specialized component
- **Integração**: Isolamento da lógica Three.js

## Responsividade e Performance

### Padrões de Responsividade

- **Mobile-First**: Design que prioriza dispositivos móveis
- **Breakpoint Strategy**: Estratégias de breakpoint bem definidas
- **CSS Grid/Flexbox**: Layout moderno e flexível

### Otimizações de Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Image Optimization**: Otimização de assets visuais
- **3D Optimization**: Modelos 3D otimizados para web
