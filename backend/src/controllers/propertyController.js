// get all properties
// get property based on id


import { Property } from "../Models/propertyModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
import imagekit from "../utils/ImagekitIO.js";


// get all properties

const getProperties = async(req,res)=>{
    try{
      const features = new APIFeatures(Property.find(),req.query)
      .filter()
      .search()
      .paginate();

      const allProperties = await Property.find();

      const doc = await features.query;

      res.status(200).json({
        status:"success",
        no_of_responses: doc.length,
        data:doc
      })
    }catch(error){
        console.error("Error searching properties: ", error)
            res.status(500).json({error:"Internal server Error"})
    }
}

//get property by id
// http://localhost:8080/api/v1/rent/listing/:id
//http://localhost:8080/api/v1/rent/listing/666476848
// req.params.id

const getProperty = async(req,res)=>{
    try{
       const property = await Property.findById(req.params.id);

       res.status(200).json({
        status:"success",
        data: property,
       })

    }catch(error){
      res.status(404).json({
        status:"fail",
        message:error.message
      })
    }
}

// CREATE A PROPERTY - an owner adds his house

// take the details, upload every photo to ImageKit,
// keep only the links, then save the house with the owner's
// id attached.
// This route has protect on it, so req.user already exists.
const createProperty = async (req, res) => {
  try {
    // Take the fields out of the body one by one. This is the
    // same idea as filterObj - we decide what we accept.
    const {
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images,
    } = req.body;
    // an empty list, we will fill it as each photo goes up
    const uploadedImages = [];

    // Go through the photos one at a time. Each one is sent to
    // ImageKit, which stores the file and hands back a url and
    // an id. The photo itself never enters our database.
    // await inside the loop = wait for this photo, then next.
    for (const image of images) {
      const result = await imagekit.upload({
        file: image.url,
        fileName: `property_${Date.now()}.jpg`,
        folder: "property_images",
      });

      uploadedImages.push({ url: result.url, public_id: result.fileId });
    }
    // Now save the house. Notice images: uploadedImages - the
    // LINKS, not the photos.
    const property = await Property.create({
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images: uploadedImages,
      // The owner comes from the token, NOT from req.body.
      // If we trusted the body, anyone could add a house under
      // someone else's name.
      userId: req.user.id,
    });

    res.status(200).json({ status: "success", data: { data: property } });
  } catch (error) {
    console.error("Error searching properties", error);
    res.status(404).json({ status: "fail", message: error.message });
  }
};

// GET MY PROPERTIES - the owner's own dashboard
// find every house whose userId is me.
const getUsersProperties = async (req, res) => {
  try {
    // again from the token, so a user can only ever see his own
    const userId = req.user._id;
    // find (not findById) because he may own many houses.
    // { userId } is short for { userId: userId }.
    const property = await Property.find({ userId });
    res.status(200).json({
      status: "success",
      data: property,
    });
  } catch (error) {
    res.status(404).json({ status: "fail", message: error.message });
  }
};


// UPDATE MY ACCOMMODATION - PUT /api/v1/rent/listing/:id
// Only the owner may modify their own property. Images already
// hosted on ImageKit are left alone; only images newly added on
// the form (their public_id still carries the temporary
// "file_"/"url_" prefix set by ImagesUploading.jsx) get uploaded.
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Accommodation not found" });
    }

    // Ownership check - do NOT trust the frontend for this.
    if (property.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to modify this accommodation",
      });
    }

    const {
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images,
    } = req.body;

    // Only touch images if the form actually sent an images array.
    if (Array.isArray(images)) {
      const updatedImages = [];

      for (const image of images) {
        const isNewImage =
          image.public_id &&
          (image.public_id.startsWith("file_") ||
            image.public_id.startsWith("url_"));

        if (isNewImage) {
          const result = await imagekit.upload({
            file: image.url,
            fileName: `property_${Date.now()}.jpg`,
            folder: "property_images",
          });
          updatedImages.push({ url: result.url, public_id: result.fileId });
        } else {
          // Already uploaded earlier - keep as is, don't re-upload.
          updatedImages.push({ url: image.url, public_id: image.public_id });
        }
      }

      property.images = updatedImages;
    }

    if (propertyName !== undefined) property.propertyName = propertyName;
    if (description !== undefined) property.description = description;
    if (propertyType !== undefined) property.propertyType = propertyType;
    if (roomType !== undefined) property.roomType = roomType;
    if (extraInfo !== undefined) property.extraInfo = extraInfo;
    if (address !== undefined) property.address = address;
    if (amenities !== undefined) property.amenities = amenities;
    if (checkInTime !== undefined) property.checkInTime = checkInTime;
    if (checkOutTime !== undefined) property.checkOutTime = checkOutTime;
    if (maximumGuest !== undefined) property.maximumGuest = maximumGuest;
    if (price !== undefined) property.price = price;

    // save() (not findByIdAndUpdate) so the pre-save hooks -
    // slug + lowercasing the city - run exactly like on create.
    const updatedProperty = await property.save();

    res.status(200).json({ status: "success", data: { data: updatedProperty } });
  } catch (error) {
    console.error("Error updating property", error);
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// DELETE MY ACCOMMODATION - DELETE /api/v1/rent/listing/:id
// A real database delete, not a frontend-only hide, so it also
// disappears from the Properties/search page (requirement #7).
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Accommodation not found" });
    }

    if (property.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to delete this accommodation",
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Accommodation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property", error);
    res.status(500).json({
      status: "fail",
      message: error.message || "Unable to delete the accommodation. Please try again.",
    });
  }
};

export{
    getProperties,
    getProperty,
    createProperty,
    getUsersProperties,
    updateProperty,
    deleteProperty
}