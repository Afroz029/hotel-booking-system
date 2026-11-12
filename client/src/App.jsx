
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'

import Home from './pages/Home'
import Footer from './components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBookings from './pages/MyBookings'
import About from './pages/About'
import Experience from './pages/Experience'

import { useUser } from '@clerk/clerk-react'

import Error404 from './components/Error404'
import HotelReg from './components/HotelReg'
import Loader from './components/Loader'

import Layout from './pages/hotelOwner/Layout'
import Dashboard from './pages/hotelOwner/Dashboard'
import AddRoom from './pages/hotelOwner/AddRoom'
import ListRoom from './pages/hotelOwner/ListRoom'

import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'


const App = () => {

  // 1. Get Clerk authentication status
  const { isLoaded, isSignedIn } = useUser()

  // 2. Get current URL
  const { pathname } = useLocation()

  // 3. Check whether user is on owner page
  const isOwnerPath =
    pathname === '/owner' || pathname.startsWith('/owner/')

  // 4. Get global application context
  const { showHotelReg } = useAppContext()


  return (
    <div>

      {/* Toast Notifications */}
      <Toaster />

      {/* Customer Navbar */}
      {!isOwnerPath && <Navbar />}

      {/* Hotel Registration Popup */}
      {showHotelReg && <HotelReg />}


      {/* Main Website Content */}
      <div className='min-h-[70vh]'>

        <Routes>

          {/* Home Page */}
          <Route
            path='/'
            element={<Home />}
          />

          {/* All Rooms Page */}
          <Route
            path='/rooms'
            element={<AllRooms />}
          />

          {/* Experience Page */}
          <Route
            path='/experience'
            element={<Experience />}
          />

          {/* About Page */}
          <Route
            path='/about'
            element={<About />}
          />

          {/* Individual Room Details */}
          <Route
            path='/rooms/:id'
            element={<RoomDetails />}
          />

          {/* Customer Bookings - Authentication Check */}
          <Route
            path='/my-bookings'
            element={
              !isLoaded ? (
                <Loader />
              ) : isSignedIn ? (
                <MyBookings />
              ) : (
                <Error404 />
              )
            }
          />

          {/* Loading Page */}
          <Route
            path='/loader/:nextUrl'
            element={<Loader />}
          />


          {/* Hotel Owner Dashboard */}
          <Route
            path='/owner'
            element={<Layout />}
          >

            {/* Default Owner Dashboard */}
            <Route
              index
              element={<Dashboard />}
            />

            {/* Add New Room */}
            <Route
              path='add-room'
              element={<AddRoom />}
            />

            {/* List All Rooms */}
            <Route
              path='list-room'
              element={<ListRoom />}
            />

          </Route>


          {/* 404 - Page Not Found */}
          <Route
            path='*'
            element={<Error404 />}
          />

        </Routes>

      </div>


      {/* Customer Footer */}
      {!isOwnerPath && <Footer />}

    </div>
  )
}


export default App
