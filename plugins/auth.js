export default function ({ $auth, redirect }) {
    if (!$auth.loggedIn) {
      redirect('/login')
    }
}