// Turns a raw accommodation/form value object into a canonical,
// comparable shape: numbers stay numbers (not "2000" vs 2000),
// strings are trimmed, and arrays (amenities/images) are sorted so
// re-ordering them doesn't look like a "change".
//
// Used by ModifyAccomodation to decide whether Update should call
// the backend or show "There are no changes!".
export const normalizeAccomodationValues = (value = {}) => {
  const address = value.address || {};

  return {
    name: (value.name || "").trim(),
    description: (value.description || "").trim(),
    propertyType: value.propertyType || "",
    roomType: value.roomType || "",
    extraInfo: (value.extraInfo || "").trim(),
    address: {
      area: (address.area || "").trim(),
      city: (address.city || "").trim().toLowerCase(),
      state: (address.state || "").trim(),
      pincode: Number(address.pincode) || 0,
    },
    // compare amenities by name only, sorted, so ticking boxes in a
    // different order doesn't count as a change
    amenities: [...(value.amenities || [])]
      .map((amenity) => amenity.name)
      .sort(),
    // compare images by url only, sorted - a re-upload of the exact
    // same photo isn't a "real" change, and public_id churn (a new
    // ImageKit id after re-upload) shouldn't count either
    images: [...(value.images || [])].map((img) => img.url).sort(),
    checkIn: value.checkIn || "",
    checkOut: value.checkOut || "",
    maximumGuest: Number(value.maximumGuest) || 0,
    price: Number(value.price) || 0,
  };
};

// Both sides are run through the same normalizer above, which
// always builds keys in the same order, so a plain JSON.stringify
// comparison is a safe, simple deep-equality check here.
export const haveAccomodationValuesChanged = (original, current) => {
  const normalizedOriginal = normalizeAccomodationValues(original);
  const normalizedCurrent = normalizeAccomodationValues(current);

  return (
    JSON.stringify(normalizedOriginal) !== JSON.stringify(normalizedCurrent)
  );
};

// Builds the form's default values object from a property fetched
// from the backend, so the Modify form starts pre-filled and its
// shape exactly matches what AccomodationForm's `form` already uses.
export const propertyToFormValues = (property = {}) => ({
  name: property.propertyName || "",
  description: property.description || "",
  propertyType: property.propertyType || undefined,
  roomType: property.roomType || undefined,
  extraInfo: property.extraInfo || "",
  images: property.images || [],
  amenities: property.amenities || [],
  address: {
    area: property.address?.area || "",
    city: property.address?.city || "",
    state: property.address?.state || "",
    pincode: property.address?.pincode || "",
  },
  checkIn: property.checkInTime || undefined,
  checkOut: property.checkOutTime || undefined,
  maximumGuest: property.maximumGuest || 0,
  price: property.price || "",
});
