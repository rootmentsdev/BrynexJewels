import Store from "../model/Store.js";
import mongoose from "mongoose";

// Fallback stores list
const fallbackStores = [
  { name: "Warehouse", locCode: "858", locName: "Warehouse", isActive: true },
  { name: "G-Edappally", locCode: "702", locName: "G-Edappally", isActive: true },
  { name: "HEAD OFFICE01", locCode: "759", locName: "HEAD OFFICE01", isActive: true },
  { name: "SG-Trivandrum", locCode: "700", locName: "SG-Trivandrum", isActive: true },
  { name: "Z-Edapally", locCode: "144", locName: "Z-Edapally", isActive: true },
  { name: "Z-Edappal", locCode: "100", locName: "Z-Edappal", isActive: true },
  { name: "Z-Perinthalmanna", locCode: "133", locName: "Z-Perinthalmanna", isActive: true },
  { name: "Z-Kottakkal", locCode: "122", locName: "Z-Kottakkal", isActive: true },
  { name: "G-Kottayam", locCode: "701", locName: "G-Kottayam", isActive: true },
  { name: "G-Perumbavoor", locCode: "703", locName: "G-Perumbavoor", isActive: true },
  { name: "G-Thrissur", locCode: "704", locName: "G-Thrissur", isActive: true },
  { name: "G-Chavakkad", locCode: "706", locName: "G-Chavakkad", isActive: true },
  { name: "G-Calicut", locCode: "712", locName: "G-Calicut", isActive: true },
  { name: "G-Vadakara", locCode: "708", locName: "G-Vadakara", isActive: true },
  { name: "G-Edappal", locCode: "707", locName: "G-Edappal", isActive: true },
  { name: "G-Perinthalmanna", locCode: "709", locName: "G-Perinthalmanna", isActive: true },
  { name: "G-Kottakkal", locCode: "711", locName: "G-Kottakkal", isActive: true },
  { name: "G-Manjeri", locCode: "710", locName: "G-Manjeri", isActive: true },
  { name: "G-Palakkad", locCode: "705", locName: "G-Palakkad", isActive: true },
  { name: "G-Kalpetta", locCode: "717", locName: "G-Kalpetta", isActive: true },
  { name: "G-Kannur", locCode: "716", locName: "G-Kannur", isActive: true },
  { name: "G-Mg Road", locCode: "718", locName: "G-Mg Road", isActive: true },
  { name: "Production", locCode: "101", locName: "Production", isActive: true },
  { name: "Office", locCode: "102", locName: "Office", isActive: true },
  { name: "WAREHOUSE", locCode: "103", locName: "WAREHOUSE", isActive: true },
  { name: "Dappr Squad", locCode: "555", locName: "Dappr Squad", isActive: true }
];

// Create a new store
export const createStore = async (req, res) => {
  try {
    const storeData = req.body;
    
    if (!storeData.name || !storeData.locCode) {
      return res.status(400).json({ 
        message: "Store name and location code (locCode) are required" 
      });
    }
    
    if (storeData.email === '' || !storeData.email) {
      delete storeData.email;
    }
    
    const store = await Store.create(storeData);
    const storeObj = store.toObject();
    storeObj.id = storeObj._id.toString();
    
    res.status(201).json({
      message: "Store created successfully",
      store: storeObj,
    });
  } catch (error) {
    console.error("Create store error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Store with this location code already exists" 
      });
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all stores
export const getStores = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const stores = await Store.find(filter).sort({ name: 1 });
    
    if (stores && stores.length > 0) {
      return res.status(200).json({
        message: "Stores retrieved successfully",
        stores: stores.map(store => {
          const obj = store.toObject();
          obj.id = obj._id.toString();
          return obj;
        }),
      });
    }

    return res.status(200).json({
      message: "Stores retrieved from fallback",
      stores: fallbackStores,
    });
  } catch (error) {
    console.error("Get stores error (using fallback):", error.message);
    return res.status(200).json({
      message: "Stores retrieved from fallback",
      stores: fallbackStores,
    });
  }
};

// Get store by ID
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }
    
    const store = await Store.findById(id);
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    const obj = store.toObject();
    obj.id = obj._id.toString();
    
    res.status(200).json({
      message: "Store retrieved successfully",
      store: obj,
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get store by location code
export const getStoreByLocCode = async (req, res) => {
  try {
    const { locCode } = req.params;
    
    const store = await Store.findOne({ locCode });
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    const storeObj = store.toObject();
    storeObj.id = storeObj._id.toString();
    
    res.status(200).json({
      message: "Store retrieved successfully",
      store: storeObj,
    });
  } catch (error) {
    console.error("Get store by locCode error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update store
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }
    
    const store = await Store.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    const obj = store.toObject();
    obj.id = obj._id.toString();
    
    res.status(200).json({
      message: "Store updated successfully",
      store: obj,
    });
  } catch (error) {
    console.error("Update store error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Store with this location code already exists" 
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete store (soft delete by setting isActive to false)
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }
    
    const store = await Store.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    res.status(200).json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
