import React, { useState } from 'react';
import './App.css';

const roomTypes = {
  A: { name: 'Room type A', price: 100, totalRooms: 2 },
  B: { name: 'Room type B', price: 80, totalRooms: 3 },
  C: { name: 'Room type C', price: 50, totalRooms: 5 }
};

function App() {
  const [bookings, setBookings] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState(0);

  // Available rooms for each type
  const [availableRooms, setAvailableRooms] = useState({
    A: roomTypes.A.totalRooms,
    B: roomTypes.B.totalRooms,
    C: roomTypes.C.totalRooms
  });

  const calculatePrice = () => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInMillis = end - start;
    const days = Math.floor(durationInMillis / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationInMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const roomPrice = roomTypes[roomType]?.price || 0;
    return (days * 24 + hours) * roomPrice;
  };

  const handleBooking = () => {
    // Validate input
    if (!name || !email || !roomType || !roomNumber || !startTime || !endTime) {
      alert('Please fill in all fields.');
      return;
    }

    // Calculate price
    const newPrice = calculatePrice();

    // Check if the selected room type has available rooms
    if (availableRooms[roomType] === 0) {
      alert(`No available rooms of type ${roomType} left.`);
      return;
    }

    // Check for overlapping bookings
    const overlap = bookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const start = new Date(startTime);
      const end = new Date(endTime);
      return roomNumber === booking.roomNumber &&
        ((start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd));
    });

    if (overlap) {
      alert('Overlapping booking detected.');
      return;
    }

    // Update available rooms count
    setAvailableRooms({
      ...availableRooms,
      [roomType]: availableRooms[roomType] - 1
    });

    // Add the new booking to the bookings array
    const newBooking = {
      id: Date.now(), // Unique id for each booking
      name: name,
      email: email,
      roomType: roomType,
      roomNumber: roomNumber,
      startTime: startTime,
      endTime: endTime,
      price: newPrice
    };
    setBookings([...bookings, newBooking]);

    // Clear form fields
    setName('');
    setEmail('');
    setRoomNumber('');
    setStartTime('');
    setEndTime('');
    setPrice(0);
  };

  // Update price when room type, start time, or end time changes
  React.useEffect(() => {
    const newPrice = calculatePrice();
    setPrice(newPrice);
  }, [roomType, startTime, endTime]);

  // Delete a booking
  const handleDelete = (id, startTime) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);

    // Calculate refund based on start time
    const currentTime = new Date();
    const bookingStartTime = new Date(startTime);
    const timeDifferenceInMillis = bookingStartTime - currentTime;
    const timeDifferenceInHours = timeDifferenceInMillis / (1000 * 60 * 60);

    let refundAmount;
    if (timeDifferenceInHours > 48) {
      refundAmount = price;
    } else if (timeDifferenceInHours > 24 && timeDifferenceInHours <= 48) {
      refundAmount = price / 2;
    } else {
      refundAmount = 0;
    }

    // Show refund amount on UI
    alert(`Refund Amount: Rs ${refundAmount}`);
  };

  // Filter bookings
  const filterBookings = () => {
    // Implement filter logic here
    // For demonstration purpose, returning all bookings
    return bookings;
  };

  return (
    <div className="App">
      <h1>Hotel Booking System</h1>
      <div className="booking-form">
        <h2>Book a Room</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="">Select Room Type</option>
          {Object.keys(roomTypes).map(type => (
            <option key={type} value={type}>{roomTypes[type].name} - Rs {roomTypes[type].price} per hour ({availableRooms[type]} available)</option>
          ))}
        </select>
        <input type="text" placeholder="Room Number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
        <input type="datetime-local" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input type="datetime-local" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <p>Price: Rs {price}</p>
        <button onClick={handleBooking}>Book</button>
      </div>
      <div className="bookings-list">
        <h2>Bookings</h2>
        {filterBookings().map((booking, index) => (
          <div className="booking" key={index}>
            <p>Name: {booking.name}</p>
            <p>Email: {booking.email}</p>
            <p>Room Type: {roomTypes[booking.roomType].name}</p>
            <p>Room Number: {booking.roomNumber}</p>
            <p>Start Time: {booking.startTime}</p>
            <p>End Time: {booking.endTime}</p>
            <p>Price: Rs {booking.price}</p>
            <button onClick={() => handleDelete(booking.id, booking.startTime)}>Cancel Booking</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
