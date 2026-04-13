# Exotic - Anonymous Q&A Social Platform

## Project Overview
- **Project Name**: Exotic
- **Type**: Social Media Q&A Application (Anonymous Ask & Answer)
- **Core Functionality**: Anonymous Q&A platform where users can ask questions anonymously and receive answers publicly
- **Target Users**: Social media users who want to receive anonymous questions and feedback

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion + AnimatePresence
- **State Management**: React Context + Hooks
- **Icons**: Custom SVG icons
- **Database**: Supabase (prepared but not connected)

## UI/UX Specification

### Color Palette
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | #ffffff | #000000 |
| Text Color | #000000 | #ffffff |
| Button Background | #000000 | #ffffff |
| Button Text | #ffffff | #000000 |
| Logo/Icons | #000000 | #ffffff |

### Typography
- **Font Family**: Geist Sans (Next.js default)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes
- **No custom fonts needed** - using Geist

### Layout Structure
1. **Navigation Bar** (Fixed top)
   - Logo (left)
   - Navigation links (center)
   - Theme toggle & Profile (right)

2. **Main Pages**
   - Home/Feed - View all public Q&A
   - Profile - Personal Q&A page
   - Ask - Anonymous question form
   - Settings - Theme toggle, account settings
   - Auth - Login/Signup

3. **Responsive Breakpoints**
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

### Design Rules
- **NO borders** anywhere
- **NO outlines** on focus states
- **NO emojis** anywhere
- **NO gradients** anywhere
- **Clean, minimal** design
- **Smooth animations** on all interactions

### Components

#### 1. Animated Logo (SVG)
- Custom designed "Exotic" text logo
- Subtle animation on hover/load
- Uses theme colors

#### 2. Custom SVG Icons
- Home icon
- Profile icon
- Ask/Question icon
- Settings icon
- Heart/Like icon
- Reply icon
- Share icon
- Moon/Sun for theme toggle
- Menu icon (mobile)
- Close icon

#### 3. Navigation
- Sticky top navigation
- Active state indicator
- Mobile hamburger menu

#### 4. Question Card
- Question text
- Answer text (if answered)
- Timestamp
- Like count
- Reply button
- Share button

#### 5. Question Form
- Anonymous question input
- Character limit indicator
- Submit button
- Real-time character count

#### 6. Answer Form
- Answer input
- Submit button
- Cancel button

#### 7. Profile Card
- Username
- Bio
- Stats (questions received, answered, likes)
- Edit profile button

#### 8. Theme Toggle
- Smooth sun/moon transition
- Persists in localStorage

#### 9. Auth Forms
- Login form
- Signup form
- Clean input fields
- Validation messages

### Animations (Framer Motion)
- Page transitions (fade + slide)
- Card hover effects
- Button press effects
- Modal open/close
- Navigation menu slide
- Theme toggle transition
- Like heart animation
- Form submission feedback

## Functionality Specification

### Core Features

#### 1. Anonymous Q&A
- Users can ask questions anonymously
- Questions appear on the receiver's profile
- Receiver can choose to answer or delete
- Answered questions are public
- Unanswered questions are private to receiver

#### 2. Real-time Updates (Supabase prepared)
- New questions appear instantly
- Answers update in real-time
- Likes update in real-time
- No page refresh needed

#### 3. User Interactions
- Like questions/answers
- Share questions
- Reply to questions
- Delete own questions/answers

#### 4. User Profile
- Custom username
- Bio description
- Profile link sharing
- Statistics display

#### 5. Theme System
- Light/Dark mode toggle
- System preference detection
- Persistent preference

#### 6. Authentication (UI ready)
- Login page
- Signup page
- Protected routes

### User Flows

#### Asker Flow
1. Visit user profile or use ask form
2. Type anonymous question
3. Submit question
4. See confirmation

#### Answerer Flow
1. View incoming questions on profile
2. Read question
3. Type answer
4. Submit answer
5. Question appears in public feed

### Data Schemas (Prepared for Supabase)

```sql
-- Users table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users, -- NULL for anonymous
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  answer TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

## Pages/Routes

1. `/` - Home/Feed (public Q&A)
2. `/login` - Login page
3. `/signup` - Signup page
4. `/profile` - Own profile with Q&A
5. `/profile/[username]` - Public user profile
6. `/ask` - Ask question form
7. `/ask/[username]` - Ask specific user
8. `/settings` - Settings page
9. `/notifications` - Notifications (future)

## Acceptance Criteria

### Visual Checkpoints
- [ ] Logo displays correctly with animation
- [ ] Theme toggle works smoothly
- [ ] All icons render as SVG
- [ ] No borders visible anywhere
- [ ] No outlines on focus
- [ ] Responsive on all breakpoints
- [ ] Animations are smooth

### Functional Checkpoints
- [ ] Navigation works without page refresh
- [ ] Theme persists across sessions
- [ ] Forms validate input
- [ ] Question submission works (UI only for now)
- [ ] Answer submission works (UI only for now)
- [ ] Like button animates
- [ ] Mobile menu works

### Technical Checkpoints
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] Build succeeds
- [ ] All routes accessible
