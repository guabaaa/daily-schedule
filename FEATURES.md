# 새로운 기능 가이드

## 구현된 기능

### 1. ✅ 헤더-그리드 겹침 문제 해결
- 헤더를 `flex-shrink: 0`으로 설정
- 그리드 컨테이너를 별도 `div`로 감싸기
- 그리드 높이를 `100%`로 조정

### 2. ✅ 계획 추가 기능

#### Floating 버튼
- 우측 하단에 고정된 `+` 버튼
- 그라디언트 배경
- 호버 시 애니메이션

#### 추가 모달
**입력 필드**:
- 제목 (필수)
- 설명 (선택)
- 시작 시간 (필수)
- 종료 시간 (필수)
- 유형 선택:
  - "실행 필요 (계획)" - `PLAN`
  - "알림만 (실행 불필요)" - `EXECUTION`

**유효성 검사**:
- 제목 필수 체크
- 종료 시간 > 시작 시간 체크

**API 통신**:
```typescript
POST /api/schedules
{
  title: string,
  description: string,
  startTimeMinutes: number,
  endTimeMinutes: number,
  type: 'PLAN' | 'EXECUTION',
  date: string
}
```

### 3. ✅ 계획 완료 기능

#### 체크박스
- 계획(PLAN) 블록에만 표시
- 이미 완료된 항목은 표시 안 함
- 좌측 상단에 배치
- 호버 시 확대 효과

#### 완료 확인 모달
- 완료하려는 계획 정보 표시
- "이 계획을 완료하셨나요?" 질문
- 확인/취소 버튼

**API 통신**:
```typescript
PATCH /api/schedules/{id}
{
  completed: true
}
```

---

## 사용 방법

### 계획 추가하기

1. 우측 하단의 **`+` 버튼** 클릭
2. 모달에서 정보 입력:
   - 제목: 예) "영어 공부"
   - 설명: 예) "토익 LC 연습"
   - 시작 시간: 09:00
   - 종료 시간: 10:30
   - 유형: 실행 필요 선택
3. **"추가"** 버튼 클릭
4. 자동으로 페이지 새로고침되며 새 계획 표시

### 계획 완료하기

1. 계획 블록 좌측 상단의 **체크박스** 클릭
2. 완료 확인 모달 표시
3. 계획 정보 확인
4. **"완료 처리"** 버튼 클릭
5. 자동으로 페이지 새로고침되며 완료 표시 (✓ 배지)

---

## 컴포넌트 구조

```
src/
├── app/
│   ├── page.tsx                           # 메인 페이지 (서버)
│   ├── ScheduleViewerWithModals.tsx       # 뷰어 + 모달 통합
│   └── ScheduleViewerWithModals.module.css
├── components/
│   ├── Modal/                             # 공통 모달
│   │   ├── Modal.tsx
│   │   └── Modal.module.css
│   ├── AddScheduleModal/                  # 계획 추가 모달
│   │   ├── AddScheduleModal.tsx
│   │   └── AddScheduleModal.module.css
│   ├── CompleteScheduleModal/             # 완료 확인 모달
│   │   ├── CompleteScheduleModal.tsx
│   │   └── CompleteScheduleModal.module.css
│   └── ScheduleBlock/
│       └── ScheduleBlockPure.tsx          # 체크박스 추가
```

---

## API 엔드포인트

### POST /api/schedules
계획 추가

**Request Body**:
```json
{
  "title": "영어 공부",
  "description": "토익 LC 연습",
  "startTimeMinutes": 540,
  "endTimeMinutes": 630,
  "type": "PLAN",
  "date": "2025-09-10"
}
```

**Response**: 201 Created
```json
{
  "id": "uuid",
  "title": "영어 공부",
  ...
}
```

### PATCH /api/schedules/{id}
계획 완료

**Request Body**:
```json
{
  "completed": true
}
```

**Response**: 200 OK
```json
{
  "id": "uuid",
  "completed": true,
  ...
}
```

---

## 스타일링

### Floating 버튼
```css
.floatingButton {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  ...
}
```

### 모달 오버레이
```css
.overlay {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}
```

### 체크박스
```css
.checkbox {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}
```

---

## 사용자 경험

### 애니메이션
- **모달**: fadeIn + slideUp
- **Floating 버튼**: hover 시 확대 + 상승
- **체크박스**: hover 시 확대

### 키보드 단축키
- **ESC**: 모달 닫기

### 접근성
- 적절한 `label` 태그
- `required` 표시
- 에러 메시지 표시
- 로딩 상태 표시

---

## 에러 처리

### 입력 유효성
```typescript
if (!title.trim()) {
  setError('제목을 입력해주세요.');
  return;
}

if (startMinutes >= endMinutes) {
  setError('종료 시간이 시작 시간보다 늦어야 합니다.');
  return;
}
```

### API 에러
```typescript
try {
  await onSubmit(data);
} catch (err) {
  setError('일정 추가에 실패했습니다. 다시 시도해주세요.');
}
```

---

## 향후 개선 사항

### 가능한 확장
- [ ] 카테고리 선택 기능
- [ ] 색상 커스터마이징
- [ ] 반복 일정 설정
- [ ] 일정 수정 모달
- [ ] 일정 삭제 기능
- [ ] 드래그 앤 드롭으로 시간 조정
- [ ] 일정 검색 기능
- [ ] 주간/월간 뷰
- [ ] 알림 기능

### 성능 개선
- [ ] Optimistic UI 업데이트
- [ ] 무한 스크롤
- [ ] 가상 스크롤
- [ ] 이미지 최적화

---

## 테스트 시나리오

### 계획 추가
1. ✅ Floating 버튼 표시 확인
2. ✅ 모달 열기/닫기
3. ✅ 필수 필드 유효성 검사
4. ✅ 시간 유효성 검사
5. ✅ API 호출 성공
6. ✅ 페이지 새로고침

### 계획 완료
1. ✅ 체크박스 표시 (PLAN만)
2. ✅ 완료된 항목 체크박스 숨김
3. ✅ 완료 모달 표시
4. ✅ API 호출 성공
5. ✅ 완료 배지 표시

### UI/UX
1. ✅ 헤더-그리드 겹침 해결
2. ✅ 애니메이션 부드러움
3. ✅ 모바일 반응형 (90% 너비)
4. ✅ 키보드 ESC로 모달 닫기

---

## 개발 팁

### 모달 상태 관리
```typescript
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithRelations | null>(null);
```

### API 호출 후 새로고침
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
await fetch('/api/schedules', { ... });
router.refresh(); // 서버 컴포넌트 데이터 재조회
```

### 이벤트 전파 방지
```typescript
const handleCheckboxClick = (e: React.MouseEvent) => {
  e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
  onComplete(id);
};
```

---

## 문제 해결

### 모달이 열리지 않음
- 상태 확인: `isOpen` props
- z-index 확인: 1000 이상

### API 호출 실패
- 네트워크 탭 확인
- 요청 Body 형식 확인
- 서버 로그 확인

### 페이지 새로고침 안 됨
- `router.refresh()` 호출 확인
- Next.js 버전 확인 (App Router)

---

## 참고 자료

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

