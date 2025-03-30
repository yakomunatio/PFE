import "./admin.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialFormState = {
  room_no: "",
  room_type: "",
  ac_status: "",
  clean_status: "",
  bed_type: "",
  price: "",
  booking_status: "",
  checkout_date: "",
};

const Admin = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState({ name: "", room_no: "" });
  const [clicked, setClicked] = useState("all");
  const [filtred, setFiltred] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [popupVisible, setPopupVisible] = useState({});
  const popupRef = useRef(null);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/rooms");
      setRooms(res.data);
      setFilteredRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchCustomers();
  }, []);

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/add-room", form);
      fetchRooms();
      toast.success("Room added successfully", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error("Error adding room", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/add-customer", customerForm);
      fetchCustomers();
      toast.success("Customer added successfully", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error("Error adding customer", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const removeRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/remove-room/${roomId}`);
      fetchRooms();
      toast.success("Room removed successfully", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error("Error removing room", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const removeCustomer = async (customerId) => {
    try {
      await axios.delete(`http://localhost:5000/remove-customer/${customerId}`);
      fetchCustomers();
      toast.success("Customer removed successfully", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error("Error removing customer", {
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const filterRoomsByBookingStatus = (status) => {
    const filtered = rooms.filter((room) => room.booking_status === status);
    setFilteredRooms(filtered);
  };

  const toggleDropdown = (id) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const togglePopup = (id) => {
    setPopupVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setPopupVisible({});
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="admin-page">
      <ToastContainer />
      <div className="header">
        <div className="title">
          <h1>Admin Panel</h1>
          <p>Here is our verious rooms.</p>
        </div>
        <div className="grup-buttons">
          <button
            onClick={() => {
              setClicked("booked");
              filterRoomsByBookingStatus("booked");
            }}
            className={clicked === "booked" ? "active" : ""}
          >
            Booked
          </button>
          <button
            onClick={() => {
              setClicked("available");
              filterRoomsByBookingStatus("available");
            }}
            className={clicked === "available" ? "active" : ""}
          >
            Available
          </button>
          <button
            onClick={() => {
              setClicked("all");
              setFilteredRooms(rooms);
            }}
            className={clicked === "all" ? "active" : ""}
          >
            All Rooms
          </button>
          <button
            className="add icon-plus"
            onClick={() => {
              setForm(initialFormState);
              setShowModal(true);
            }}
          ></button>
        </div>
      </div>

      
        <div className="tabel">
          <div className="discription">
            <ul>
              <li>Room No</li>
              <li>Room</li>
              <li>AC</li>
              <li>Cleaning</li>
              <li>Bed Type</li>
              <li>Price</li>
              <li>Status </li>
              <li>Checkout</li>
              <li>Actions</li>
            </ul>
          </div>
          {filteredRooms.map((room, index) => (
            <article key={index}>
              <ul className="room">
                <li style={{ color: "#6678FF" }}>{room.room_no}</li>
                <li className="val">{room.room_type}</li>
                <li className="val">{room.ac_status}</li>
                <li className="val">{room.clean_status}</li>
                <li className="val">{room.bed_type}</li>
                <li style={{ color: "#000" }}>
                  <span style={{ fontWeight: "bold" }}>{room.price}</span> DH
                </li>
                <li>{room.booking_status}</li>
                <li>{room.checkout_date || "N/A"}</li>
                <li>
                  <button
                    className="icon-bin remove"
                    onClick={() => removeRoom(room.id)}
                  ></button>
                </li>
              </ul>
            </article>
          ))}
        </div>
      

      {showModal && (
        <div className="fixed">
          <div className="modal">
            <h2>Add New Room</h2>
            <form onSubmit={addRoom}>
              <div className="parametrs">
                <input
                  type="number"
                  placeholder="Room No"
                  value={form.room_no}
                  onChange={(e) => setForm({ ...form, room_no: e.target.value })}
                  required
                />
                <select
                  value={form.room_type}
                  onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                  required
                >
                  <option value="">Select Room Type</option>
                  <option value="1 person">1 Person</option>
                  <option value="2 person">2 Person</option>
                  <option value="3 person">3 Person</option>
                  <option value="4 person">4 Person</option>
                </select>
                <select
                  value={form.ac_status}
                  onChange={(e) => setForm({ ...form, ac_status: e.target.value })}
                  required
                >
                  <option value="">Select AC Status</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
                <select
                  value={form.clean_status}
                  onChange={(e) => setForm({ ...form, clean_status: e.target.value })}
                  required
                >
                  <option value="">Select Cleaning Status</option>
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                </select>
                <select
                  value={form.bed_type}
                  onChange={(e) => setForm({ ...form, bed_type: e.target.value })}
                  required
                >
                  <option value="">Select Bed Type</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
                <select
                  value={form.booking_status}
                  onChange={(e) => setForm({ ...form, booking_status: e.target.value })}
                  required
                >
                  <option value="">Select Booking Status</option>
                  <option value="booked">Booked</option>
                  <option value="available">Available</option>
                </select>
                <input
                  type="date"
                  placeholder="Checkout Date"
                  value={form.checkout_date}
                  onChange={(e) => setForm({ ...form, checkout_date: e.target.value })}
                />
              </div>

              <div style={{ padding: "5%", display: "flex", gap: "5%" }}>
                <button className="Add" type="submit">
                  Add Room
                </button>
                <button
                  className="cancel"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="customer-list">
        <h3>Customer List</h3>
        <button
          className="add icon-plus"
          onClick={() => setShowCustomerModal(true)}
        ></button>
      </div>
      <div className="tabel">
        <div className="discription">
          <ul>
            <li>Name</li>
            <li>Room No</li>
            <li>Actions</li>
          </ul>
        </div>
        {customers.map((customer, index) => (
          <article key={index}>
            <ul className="room">
              <li>{customer.name}</li>
              <li>{customer.room_no}</li>
              <li>
                <button
                  className="icon-bin remove"
                  onClick={() => removeCustomer(customer.id)}
                ></button>
              </li>
            </ul>
          </article>
        ))}
      </div>

      {showCustomerModal && (
        <div className="fixed">
          <div className="modal">
            <h2>Add New Customer</h2>
            <form onSubmit={addCustomer}>
              <div className="customer-parametrs">
                <input
                  type="text"
                  placeholder="Name"
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, name: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Room No"
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      room_no: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={{ padding: "5%", display: "flex", gap: "5%" }}>
                <button type="submit" className="Add">
                  Add Customer
                </button>
                <button
                  className="cancel"
                  onClick={() => {
                    setShowCustomerModal(false);
                  }}
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="admin-footer">
        <p>Copyright &copy; 2025 YARB company - Yassine Achhachar</p>
      </footer>
    </div>
  );
};

export default Admin;
