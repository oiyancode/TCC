# Contexto Técnico - BlueHouse Store

## Stack Tecnológico Principal

### Framework Core

- **Angular**: v19.2.6 - Framework JavaScript/TypeScript moderno
- **TypeScript**: v5.7.2 - Superset tipado do JavaScript
- **RxJS**: v7.8.0 - Programação reativa e observables
- **Zone.js**: v0.15.0 - Change detection para Angular

### Rendering 3D

- **Three.js**: v0.181.1 - Biblioteca de renderização 3D para WebGL
- **@types/three**: v0.181.0 - Tipos TypeScript para Three.js

### Animações e Interatividade

- **GSAP**: v3.13.0 - Animations de alta performance
- **Swiper**: v11.2.10 - Carrossel moderno e touch-friendly

## Estrutura de Desenvolvimento

### Angular CLI Configuration

```json
{
  "version": "19.2.6",
  "projects": {
    "ideia-tcc": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      }
    }
  }
}
```

### Compilação e Build

- **@angular-devkit/build-angular**: v19.2.6
- **@angular/compiler-cli**: v19.2.0
- **tslib**: v2.3.0 - Utilitários TypeScript
- **Output**: dist/ideia-tcc/ (produção otimizada)

### Módulos Angular Utilizados

```typescript
import {
  CommonModule, // Diretivas comuns Angular
  HttpClientModule, // Requisições HTTP
  RouterModule, // Sistema de roteamento
  FormsModule, // Formulários reativos (futuro)
  BrowserAnimationsModule, // Animações GSAP
} from '@angular/core';
```

## Organização de Assets

### Estrutura de Recursos

```
src/assets/
├── products.json                    # Dados de produtos
├── Modelos_3D/                     # Modelos 3D
│   ├── Basketball.glb             # Modelo basquete
│   ├── Nike_Kaiser_Opt.glb        # Modelo tênis Nike
│   └── Skate_02.glb               # Modelo skate
├── icons/                          # Ícones SVG
├── BGs/                           # Backgrounds
└── section_news/                  # Imagens de notícias
```

### Otimização de Assets

- **GLB Format**: Modelos 3D em formato binário otimizado
- **SVG Icons**: Ícones escaláveis sem perda de qualidade
- **PNG Optimization**: Imagens otimizadas para web

## Padrões de Código

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Component Pattern

```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  // Lógica do componente
}
```

### Service Pattern

```typescript
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/assets/products.json');
  }
}
```

## Integração Three.js

### Componente three-viewer

- **Propósito**: Renderização 3D isolada
- **Tecnologia**: Three.js com WebGL
- **Modelos**: GLB (GLTF Binary)
- **Interações**: Mouse, touch, zoom, rotação

### Performance Considerations

- **Scene Optimization**: Meshes otimizados para web
- **Texture Compression**: Texturas comprimidas
- **Level of Detail**: Níveis de detalhes adaptativos
- **Culling**: Frustum culling para performance

## Estado e Dados

### Gerenciamento de Estado

- **Service-based**: Estados via services Angular
- **Observable Pattern**: RxJS para streams de dados
- **HTTP Caching**: Cache em memória

### Fontes de Dados

```typescript
// products.json structure
[
  {
    id: 1,
    name: 'Tênis Nike Kaiser',
    price: 'R$ 299,99',
    imageSrc: 'assets/tenis.png',
    variant: 'tenis',
    cssClass: 'product-tenis',
  },
];
```

## Testing e Quality Assurance

### Testing Stack

- **Jasmine**: v5.6.0 - Framework de testes
- **Karma**: v6.4.0 - Test runner
- **@types/jasmine**: v5.1.0 - Tipos TypeScript

### Comandos de Teste

```bash
npm test          # Executa testes unitários
ng test           # Via Angular CLI
npm run watch     # Testes em modo watch
```

## Deployment e Build

### Build Commands

```bash
npm start         # ng serve (desenvolvimento)
npm run build     # ng build --prod
npm run watch     # build --watch --dev
```

### Estrutura de Build

```
dist/
├── idea-tcc/
│   ├── index.html
│   ├── main.js
│   ├── polyfills.js
│   ├── styles.css
│   └── assets/
│       ├── models/
│       ├── images/
│       └── data/
```

### Otimizações de Produção

- **Tree Shaking**: Remoção de código não utilizado
- **Minification**: Compressão de JavaScript/CSS
- **AOT Compilation**: Ahead-of-Time compilation
- **Bundle Splitting**: Divisão otimizada de bundles

## Configurações de Ambiente

### Development

- **Port**: 4200 (padrão Angular CLI)
- **Hot Reload**: Ativo por padrão
- **Source Maps**: Incluídos para debug

### Production

- **Optimizations**: Ativadas automaticamente
- **Source Maps**: Removidos
- **Bundle Size**: Otimizado para performance

## Ferramentas de Desenvolvimento

### IDE e Extensões

- **Visual Studio Code**: Editor principal
- **Angular DevTools**: Debugging e profiling
- **Three.js Editor**: Modelagem 3D (futuro)

### CLI Tools

- **@angular/cli**: v19.2.6
- **TypeScript**: v5.7.2
- **npm**: Gerenciador de pacotes

## Considerações de Performance

### Frontend Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **OnPush Strategy**: Change detection otimizada (futuro)
- **Virtual Scrolling**: Para listas longas (futuro)

### 3D Performance

- **WebGL Optimization**: Rendering otimizado
- **Texture Streaming**: Carregamento progressivo
- **Adaptive Quality**: Qualidade adaptativa por device
