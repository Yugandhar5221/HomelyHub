import slugify from 'slugify';
import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    propertyName: {
        type: String,
        required: [true, 'Please enter yourproperty name']
    },
    description: {
        type: String,
        required: [true, 'Please add information about your property']
    },
    extraInfo: {
        type: String,
        default: "Checkin on time. We are happy to accommodate early checkin and late checkout whenever possible. Please contact us if you have any special requests."
    },
    propertyType: {
        type: String,
        enum: ["House", "Flat", "Guest House", "Hotel"],
        default: "House"
    },
    roomType: {
        type: String,
        enum: ["Anytype", "Entire Home", "Room",],
        default: "Anytype"
    },

    maximumGuest: {
        type: Number,
        required: [true, "Please give the maximum no of guest that can occupy"]
    },

    amenities: [
        {
            name: {
                type: String,
                required: true,
                enum: ["Wifi", "TV", "AC", "Kitchen", "Free Parking", "Pool", "Washing Machine"]
            },
            icon: {
                type: String,
                required: true
            }
        }
    ],
    images: {
        type: [
            {
                public_id: {
                    type: String
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        validate: {
            validator: function (arr) {
                return arr.length >= 6;
            },
            message: "Please upload at least six images"
        }
    },
        price: {
            type: Number,
            required: [true, "Please enter the price per night value"],
            default: 500
    },
    address: {
        area: String,
        city: String,
        state: String,
        pincode: Number
    },
    // 
    currentBookings: [
           {
            bookingId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking"
            },
            fromDate: {
                type: Date
            },
            toDate: {
                type: Date
            },
            userId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
           }
    ],

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    slug: String,
    checkInTime: {type: String, default: "11:00"},
    checkOutTime: {type: String, default: "13:00"}
})

propertySchema.pre("save", function () {
    this.slug = slugify(this.propertyName, { lower: true });
})

propertySchema.pre("save", function () {
    this.address.city = this.address.city.toLowerCase().replaceAll(" ", "");
})

//const Property = mongoose.model("Property", propertySchema);
const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);

export { Property };