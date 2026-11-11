
import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const HotelCards = ({ room, index }) => {

  // Safety check: Don't display a card if room data is missing
  if (!room || !room.hotel) return null

  return (
    <Link
      to={`/rooms/${room._id}`}
      onClick={() => window.scrollTo(0, 0)}
      className="relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300"
    >

      {/* Room Image */}
      <img
        src={room.images?.[0] || assets.heroImage}
        alt={room.hotel.name || 'Hotel room'}
        className="w-full h-48 object-cover"
      />

      {/* Best Seller Badge */}
      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full">
          Best Seller
        </p>
      )}

      <div className="p-4">

        {/* Hotel Name and Rating */}
        <div className="flex items-center justify-between gap-2">

          <p className="font-playfair text-xl text-gray-800 font-medium truncate">
            {room.hotel.name}
          </p>

          <div className="flex items-center gap-1 shrink-0">
            <img
              src={assets.starIconFilled}
              alt="Rating"
              className="w-4 h-4"
            />
            <span className="text-sm">4.5</span>
          </div>

        </div>

        {/* Hotel Address */}
        <div className="flex items-center gap-1 text-sm mt-2">

          <img
            src={assets.locationIcon}
            alt="Location"
            className="w-4 h-4"
          />

          <span className="truncate">
            {room.hotel.address || 'Address unavailable'}
          </span>

        </div>

        {/* Room Price and Book Button */}
        <div className="flex items-center justify-between mt-4">

          <p>
            <span className="text-xl text-gray-800 font-semibold">
              ${room.pricePerNight}
            </span>
            <span className="text-sm"> /night</span>
          </p>

          <span className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all">
            Book Now
          </span>

        </div>

      </div>

    </Link>
  )
}

export default HotelCards
