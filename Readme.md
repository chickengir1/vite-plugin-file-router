# vite-plugin-file-router

**vite-plugin-file-router**는 Vite와 React 프로젝트에서 Next.js와 같은 파일 기반 라우팅을 손쉽게 구현할 수 있도록 도와주는 플러그인입니다.  
플러그인은 `src/pages` 폴더 내부의 모든 `.tsx` 페이지 파일을 자동으로 스캔하여, 라우트 설정 파일(`RouterConfig.tsx`)을 생성합니다.  
추가로, 사용자가 옵션으로 전달한 **404 페이지**와 **로딩 컴포넌트**를 자동으로 import하여 적용합니다.

---

## 설치

```bash
# npm
npm install vite-plugin-file-router

# yarn
yarn add vite-plugin-file-router
```

---

## 사용법

### 1. Vite 설정 파일 구성

`vite.config.ts` 파일에서 플러그인을 import한 후, 플러그인 옵션과 함께 등록합니다.  
옵션으로는 페이지들이 위치한 디렉토리(`pagesDir`)와 404 페이지, 로딩 컴포넌트의 경로를 전달할 수 있습니다.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fileRouterPlugin from "vite-plugin-file-router";

export default defineConfig({
  plugins: [
    react(),
    fileRouterPlugin({
      pagesDir: "src/pages", // 페이지 파일들이 위치한 디렉토리
      notFoundPage: "src/pages/404.tsx", // 404 에러 페이지 컴포넌트 경로
      loadingComponent: "src/components/Loading.tsx", // 로딩 시 보여줄 컴포넌트 경로
    }),
  ],
});
```

> **참고:**  
> 플러그인은 빌드 시 자동으로 `src/RouterConfig.tsx` 파일을 생성하며, 이 파일에 `<Suspense>`의 `fallback`과 404 라우트가 포함됩니다.
>
> - `<Suspense fallback={...}>`에는 옵션으로 전달된 로딩 컴포넌트(`Loading`) 또는 기본 `<div>Loading...</div>`가 적용됩니다.
> - `<Route path="*">`에는 옵션으로 전달된 404 페이지 컴포넌트(`NotFound`) 또는 기본 `<div>404 Not Found</div>`가 적용됩니다.

---

### 2. 페이지 컴포넌트 작성

`src/pages` 디렉토리 내부에 페이지 컴포넌트를 작성합니다.

#### 홈 페이지 예시 (`src/pages/index.tsx`)

```tsx
// src/pages/index.tsx
import React from "react";

function HomePage(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">홈 페이지</h1>
      <p>환영합니다!</p>
    </div>
  );
}

export default HomePage;
```

#### 소개 페이지 예시 (`src/pages/about.tsx`)

```tsx
// src/pages/about.tsx
import React from "react";

function AboutPage(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">소개 페이지</h1>
      <p>플러그인 사용 예시입니다.</p>
    </div>
  );
}

export default AboutPage;
```

---

### 3. 404 페이지 및 로딩 컴포넌트 작성

#### 404 페이지 예시 (`src/pages/404.tsx`)

```tsx
// src/pages/404.tsx
import React from "react";

function NotFoundPage(): JSX.Element {
  return (
    <div className="p-4 text-center text-red-500">
      <h1 className="text-2xl font-bold">404 - 페이지를 찾을 수 없습니다.</h1>
      <p>죄송합니다. 요청하신 페이지는 존재하지 않습니다.</p>
    </div>
  );
}

export default NotFoundPage;
```

#### 로딩 컴포넌트 예시 (`src/components/Loading.tsx`)

```tsx
// src/components/Loading.tsx
import React from "react";

function Loading(): JSX.Element {
  return (
    <div className="p-4 text-center">
      <p className="text-lg">로딩 중...</p>
    </div>
  );
}

export default Loading;
```

---

### 4. App 컴포넌트에서 사용

자동 생성된 `RouterConfig.tsx` 파일을 App 컴포넌트에서 불러와 사용합니다.  
이 파일은 플러그인에 의해 자동 생성되며, `<BrowserRouter>`, `<Suspense>`, `<Routes>` 및 404 라우트가 포함되어 있습니다.

```tsx
// src/App.tsx
import React from "react";
import RouterConfig from "./RouterConfig"; // 플러그인에 의해 자동 생성됨

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <RouterConfig />
    </div>
  );
}

export default App;
```

---

### 5. 프로젝트 실행

Vite 개발 서버를 실행하여 정상 동작하는지 확인합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 등 해당 주소로 접속하면,  
파일 기반 라우팅에 따라 `/` (홈 페이지), `/about` (소개 페이지) 등 페이지가 정상적으로 렌더링되고,  
존재하지 않는 경로로 접근할 경우 404 페이지가 표시되며, 페이지 전환 시 로딩 컴포넌트가 적용됩니다.

---

## 플러그인 동작 방식

- **자동 파일 스캔:**  
  플러그인은 `src/pages` 폴더 내의 모든 `.tsx` 파일을 자동으로 스캔하여, 라우트 경로를 생성합니다.  
  예를 들어,

  - `index.tsx` → `/`
  - `about.tsx` → `/about`
  - `[id].tsx` → `/:id`

- **로딩 및 404 처리:**

  - 플러그인 옵션으로 전달한 `loadingComponent`가 있으면 `<Suspense fallback={...}>`에 적용되고,  
    없으면 기본 `<div>Loading...</div>`가 사용됩니다.
  - `notFoundPage` 옵션이 있으면 404 라우트의 요소로 `<NotFound />`가 적용되며,  
    없으면 기본 `<div>404 Not Found</div>`가 사용됩니다.

- **자동 파일 생성:**  
  플러그인은 파일 추가/삭제 시 `RouterConfig.tsx` 파일을 갱신하므로,  
  페이지 파일을 수정하면 자동으로 라우팅이 업데이트됩니다.

---

이와 같이 플러그인을 설치하고 구성하면, 별도의 라우팅 설정 없이 파일 기반 라우팅을 쉽게 구현할 수 있습니다.

추가 질문이나 문제가 있으시면 [GitHub Issues](https://github.com/chickengir1/vite-plugin-file-router/issues)에 남겨주세요.

---

> **Tip:** 파일 기반 라우팅은 파일 및 디렉토리 구조를 그대로 반영하므로,  
> 페이지 파일을 추가/삭제할 때마다 라우트가 자동으로 갱신되어 개발 효율성을 높입니다.

---
