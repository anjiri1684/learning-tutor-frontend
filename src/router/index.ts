import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import FindTeachersView from '@/views/FindTeachersView.vue'
import TeacherProfileView from '@/views/TeacherProfileView.vue'
import BookingView from '@/views/BookingView.vue'
import MyClassesView from '@/views/MyClassesView.vue'
import MyProfileView from '@/views/MyProfileView.vue'
import MyCertificatesView from '@/views/MyCertificatesView.vue'
import MyBundlesView from '@/views/MyBundlesView.vue'
import PurchaseBundleView from '@/views/PurchaseBundleView.vue'
import MyBadgesView from '@/views/MyBadgesView.vue'
import MyMessagesView from '@/views/MyMessagesView.vue'
import ExamListView from '@/views/ExamListView.vue'
import ExamResultsView from '@/views/ExamResultsView.vue'
import ApplyToTeachView from '@/views/ApplyToTeachView.vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import TeacherClassesView from '@/views/teacher/TeacherClassesView.vue'
import TeacherAvailabilityView from '@/views/teacher/TeacherAvailabilityView.vue'
import TeacherRescheduleView from '@/views/teacher/TeacherRescheduleView.vue'
import TeacherEarningsView from '@/views/teacher/TeacherEarningsView.vue'
import TeacherReviewsView from '@/views/teacher/TeacherReviewsView.vue'
import StudentProgressView from '@/views/teacher/StudentProgressView.vue'
import MyProfileViewTeacher from '@/views/teacher/MyProfileViewTeacher.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminTeacherApplicationsView from '@/views/admin/AdminTeacherApplicationsView.vue'
import AdminLanguagesView from '@/views/admin/AdminLanguagesView.vue'
import AdminBundlesView from '@/views/admin/AdminBundlesView.vue'
import AdminPayoutsView from '@/views/admin/AdminPayoutsView.vue'
import AdminReportsView from '@/views/admin/AdminReportsView.vue'
import AdminBookingsView from '@/views/admin/AdminBookingsView.vue'
import AdminRefundsView from '@/views/admin/AdminRefundsView.vue'
import AdminExamsView from '@/views/admin/AdminExamsView.vue'
import AdminPaymentsView from '@/views/admin/AdminPaymentsView.vue'
import AdminReviewsView from '@/views/admin/AdminReviewsView.vue'
import MyProgressView from '@/views/MyProgressView.vue'
import TeacherAnalyticsView from '@/views/teacher/TeacherAnalyticsView.vue'
import LandingPageView from '@/views/LandingPageView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPageView,
    },

    {
      path: '/dashboard/',
      component: MainLayout,
      children: [
        { path: '', name: 'home', component: HomeView, meta: { requiresAuth: true } },
        {
          path: 'find-teachers',
          name: 'find-teachers',
          component: FindTeachersView,
          meta: { requiresAuth: true },
        },
        {
          path: 'book',
          name: 'book',
          component: BookingView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-classes',
          name: 'my-classes',
          component: MyClassesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'my-profile',
          component: MyProfileView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-certificates',
          name: 'my-certificates',
          component: MyCertificatesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-bundles',
          name: 'my-bundles',
          component: MyBundlesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'bundles',
          name: 'purchase-bundle',
          component: PurchaseBundleView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-badges',
          name: 'my-badges',
          component: MyBadgesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-progress',
          name: 'my-progress',
          component: MyProgressView,
          meta: { requiresAuth: true },
        },
        {
          path: 'my-messages',
          name: 'my-messages',
          component: MyMessagesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'exams',
          name: 'exam-list',
          component: ExamListView,
          meta: { requiresAuth: true },
        },
        {
          path: 'exam/results',
          name: 'exam-results',
          component: ExamResultsView,
          meta: { requiresAuth: true },
        },
        {
          path: 'apply-to-teach',
          name: 'apply-to-teach',
          component: ApplyToTeachView,
          meta: { requiresAuth: true },
        },
        {
          path: '/teacher/:id',
          name: 'teacher-profile',
          component: TeacherProfileView,
          meta: { requiresAuth: true },
        },
        {
          path: '/apply-to-teach',
          redirect: '/dashboard/apply-to-teach',
        },
      ],
    },

    {
      path: '/teacher',
      component: TeacherLayout,
      meta: { requiresAuth: true, requiresRole: 'teacher' },
      children: [
        { path: '', redirect: '/teacher/classes' },
        { path: 'classes', name: 'teacher-classes', component: TeacherClassesView },
        { path: 'availability', name: 'teacher-availability', component: TeacherAvailabilityView },
        { path: 'reschedules', name: 'teacher-reschedules', component: TeacherRescheduleView },
        { path: 'earnings', name: 'teacher-earnings', component: TeacherEarningsView },
        { path: 'profile', name: 'teacher-my-profile', component: MyProfileViewTeacher },
        { path: 'analytics', name: 'teacher-analytics', component: TeacherAnalyticsView },
        { path: 'messages', name: 'teacher-messages', component: MyMessagesView },
        { path: 'reviews', name: 'teacher-reviews', component: TeacherReviewsView },
        {
          path: 'student-progress/:studentId',
          name: 'teacher-student-progress',
          component: StudentProgressView,
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresRole: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardView,
        },
        {
          path: 'users',
          name: 'admin-users',
          component: AdminUsersView,
        },
        {
          path: 'teacher-applications',
          name: 'admin-teacher-applications',
          component: AdminTeacherApplicationsView,
        },
        {
          path: 'languages',
          name: 'admin-languages',
          component: AdminLanguagesView,
        },
        { path: 'bundles', name: 'admin-bundles', component: AdminBundlesView },
        { path: 'payouts', name: 'admin-payouts', component: AdminPayoutsView },
        { path: 'reports', name: 'admin-reports', component: AdminReportsView },
        { path: 'bookings', name: 'admin-bookings', component: AdminBookingsView },
        { path: 'refunds', name: 'admin-refunds', component: AdminRefundsView },
        { path: 'exams', name: 'admin-exams', component: AdminExamsView },
        { path: 'payments', name: 'admin-payments', component: AdminPaymentsView },
        { path: 'reviews', name: 'admin-reviews', component: AdminReviewsView },
      ],
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordView },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  console.log('Navigating to:', to.path, 'Authenticated:', isAuthenticated, 'User:', authStore.user)

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login: User not authenticated')
    next({ name: 'login' })
  } else if (to.meta.requiresAuth && isAuthenticated && !authStore.user) {
    console.log('User data not loaded, fetching user...')
    try {
      await authStore.fetchUser()
      if (!authStore.user) {
        console.log('User fetch failed, redirecting to login')
        next({ name: 'login' })
        return
      }
    } catch (error) {
      console.log('Error fetching user, redirecting to login:', error)
      next({ name: 'login' })
      return
    }
  }

  if (isAuthenticated && to.meta.requiresRole && authStore.user?.role !== to.meta.requiresRole) {
    console.log('Role check failed:', authStore.user?.role, 'Required:', to.meta.requiresRole)
    if (!authStore.user || !authStore.user.role) {
      console.log('No user or role, redirecting to login')
      next({ name: 'login' })
    } else {
      switch (authStore.user.role) {
        case 'student':
          console.log('Redirecting to home: User is student')
          next({ name: 'home' })
          break
        case 'teacher':
          console.log('Redirecting to teacher dashboard: User is teacher')
          next({ path: '/teacher' })
          break
        case 'admin':
          console.log('Redirecting to admin dashboard: User is admin')
          next({ path: '/admin' })
          break
        default:
          console.log('Unknown role, redirecting to login')
          next({ name: 'login' })
      }
    }
  } else {
    console.log('Navigation allowed to:', to.path)
    next()
  }
})

export default router
