# 문제 해결 가이드

## 겹침 레이아웃이 작동하지 않을 때

### 증상
- 일정들이 옆으로 나란히 배치되지 않음
- 일정들이 위로 겹쳐서 표시됨
- 뒤에 다른 레이어가 보임

### 해결 방법

#### 1. 브라우저 콘솔 확인
```
개발자 도구 (F12) → Console 탭 확인
```

**확인사항**:
- `Schedules:` - 각 일정의 시작/종료 시간
- `Blocks:` - 계산된 width, left, zIndex

**예상 출력**:
```javascript
Schedules: [
  { id: '1', title: '사회문화 수행', start: 540, end: 630 },
  { id: '2', title: '다른 일정', start: 570, end: 650 }
]

Blocks: [
  { id: '1', title: '사회문화 수행', width: 49.75, left: 0, zIndex: 1 },
  { id: '2', title: '다른 일정', width: 49.75, left: 50.25, zIndex: 1 }
]
```

#### 2. width가 100%인 경우
모든 블록의 width가 100%라면 겹침 감지가 실패한 것입니다.

**가능한 원인**:
- 시간 데이터가 잘못됨
- 겹침 계산 로직 오류

**해결**:
```bash
# 데이터베이스 확인
npm run db:studio

# 시드 데이터 재생성
npm run db:seed
```

#### 3. CSS 문제
레이아웃은 제대로 계산되었지만 화면에 제대로 표시되지 않는 경우

**확인사항**:
```css
/* schedules 컨테이너가 relative여야 함 */
.schedules {
  position: relative;
}

/* 블록이 absolute여야 함 */
.block {
  position: absolute;
}
```

#### 4. zIndex 문제
모든 블록의 zIndex가 다르면 위로 쌓입니다.

**확인**:
- 겹치는 일정들은 모두 `zIndex: 1`이어야 함
- 독립 일정은 `zIndex: 0`

---

## 체크박스/완료 배지 문제

### 증상
- 체크박스가 텍스트와 겹침
- 클릭이 안 됨

### 해결

#### 우측 상단 배지로 통합
- ✅ 완료: ✓ 표시 (초록색)
- ⭕ 미완료: ○ 표시 (회색, 클릭 가능)

**CSS**:
```css
.completeBadge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}
```

---

## 일정 추가가 안 될 때

### 증상
- 추가 버튼을 눌렀지만 일정이 추가되지 않음

### 확인사항

#### 1. 네트워크 요청 확인
```
개발자 도구 → Network 탭
POST /api/schedules 확인
```

#### 2. 서버 로그 확인
```bash
# 터미널에서 확인
# prisma:query 로그가 보여야 함
```

#### 3. 데이터베이스 확인
```bash
npm run db:studio
# Schedule 테이블에 데이터가 추가되었는지 확인
```

---

## 페이지 새로고침이 안 될 때

### 증상
- 일정을 추가/완료했지만 화면이 업데이트되지 않음

### 해결

#### router.refresh() 확인
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// API 호출 후
await fetch('/api/schedules', { ... });
router.refresh(); // 서버 컴포넌트 데이터 재조회
```

#### 캐시 문제
```bash
# .next 폴더 삭제 후 재시작
rm -rf .next
npm run dev
```

---

## 모달이 열리지 않을 때

### 증상
- 버튼을 눌렀지만 모달이 나타나지 않음

### 확인사항

#### 1. 상태 확인
```typescript
const [isOpen, setIsOpen] = useState(false);

// 버튼 클릭 시
onClick={() => setIsOpen(true)}
```

#### 2. z-index 확인
```css
.overlay {
  z-index: 1000; /* 충분히 높아야 함 */
}
```

#### 3. Portal 사용 (선택사항)
```typescript
import { createPortal } from 'react-dom';

return createPortal(
  <Modal ...>,
  document.body
);
```

---

## 개발 서버 문제

### 증상
- 서버가 시작되지 않음
- 포트가 사용 중

### 해결

#### 1. 포트 확인
```bash
# 3000 포트 사용 중인 프로세스 찾기
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

#### 2. 재시작
```bash
npm run dev
```

#### 3. 데이터베이스 연결 확인
```bash
# prisma 상태 확인
npx prisma studio
```

---

## 테스트 실패

### 증상
- 테스트가 실패함

### 해결

#### 1. 테스트 실행
```bash
npm test
```

#### 2. 특정 테스트만 실행
```bash
npm test -- overlapCalculation
```

#### 3. 테스트 업데이트
레이아웃 로직을 변경한 경우 테스트도 업데이트해야 합니다.

---

## 디버깅 팁

### 1. 콘솔 로그
```typescript
console.log('Schedules:', schedules);
console.log('Blocks:', blocks);
```

### 2. React DevTools
```
F12 → Components 탭
Props 확인
```

### 3. Prisma Studio
```bash
npm run db:studio
# 데이터 직접 확인 및 수정
```

### 4. Network 탭
```
F12 → Network 탭
API 요청/응답 확인
```

---

## 자주 묻는 질문

### Q: 일정이 겹치는데 옆으로 안 나뉘어요
A: 브라우저 콘솔에서 width 값 확인 → 모두 100%면 겹침 감지 실패

### Q: 체크를 눌러도 완료가 안 돼요
A: 네트워크 탭에서 PATCH 요청 확인 → 에러 확인

### Q: 추가한 일정이 안 보여요
A: `router.refresh()` 호출 확인 → Prisma Studio에서 데이터 확인

### Q: 테스트가 실패해요
A: 레이아웃 로직 변경 시 테스트도 업데이트 필요

---

## 연락처

문제가 계속되면:
1. 브라우저 콘솔 스크린샷
2. 네트워크 탭 스크린샷
3. 에러 메시지

를 첨부해주세요.

