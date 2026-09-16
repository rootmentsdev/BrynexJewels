import { useState, useEffect, useRef } from "react";
import { useEnterToSave } from "../hooks/useEnterToSave";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Search, X, Plus, Pencil, Image as ImageIcon, ChevronDown, Mail, Printer, Download, Trash2, Link as LinkIcon, Package, PackageX, MoreVertical, Upload, Calendar, Check, ArrowLeft, Settings, UploadCloud, Minus, Layers, RotateCw } from "lucide-react";
import baseUrl from "../api/api";
import { mapLocNameToWarehouse as mapWarehouse } from "../utils/warehouseMapping";
import ImageUpload from "../components/ImageUpload";
import useSidebar from "../hooks/useSidebar";
import Header from "../components/Header";

const Label = ({ children, required = false }) => (
  <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${required ? "text-[#ef4444]" : "text-[#64748b]"}`}>
    {children}
    {required && <span className="ml-0.5">*</span>}
  </span>
);

const Input = ({ placeholder = "", className = "", ...props }) => {
  const baseClasses = "w-full rounded-none border border-[#d7dcf5] bg-white text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all";
  const tableInputClasses = "h-[40px] px-3 py-2";
  const defaultClasses = "px-4 py-3";
  
  const isTableInput = className.includes("table-input");
  const finalClasses = `${baseClasses} ${isTableInput ? tableInputClasses : defaultClasses} ${className}`;
  
  return (
    <input
      {...props}
      className={finalClasses}
      placeholder={placeholder}
    />
  );
};

const Select = ({ className = "", ...props }) => {
  const baseClasses = "w-full rounded-none border border-[#d7dcf5] bg-white text-sm text-[#1f2937] focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all cursor-pointer";
  const tableInputClasses = "h-[40px] px-3 py-2";
  const defaultClasses = "px-4 py-3";
  
  const isTableInput = className.includes("table-input");
  const finalClasses = `${baseClasses} ${isTableInput ? tableInputClasses : defaultClasses} ${className}`;
  
  return (
    <select
      {...props}
      className={finalClasses}
    />
  );
};

// TaxDropdown Component (from PurchaseOrderCreate)
const TaxDropdown = ({ rowId, value, onChange, taxOptions, nonTaxableOptions, onNewTax, className = "", placeholder = "Select a Tax", ...props }) => {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTax, setSelectedTax] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (value) {
      const tax = [...taxOptions, ...nonTaxableOptions].find((t) => t.id === value);
      setSelectedTax(tax);
    } else {
      setSelectedTax(null);
    }
  }, [value, taxOptions, nonTaxableOptions]);

  const updatePos = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 280),
    });
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen) updatePos();
    setIsOpen((p) => !p);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePos();
      setTimeout(updatePos, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const follow = () => updatePos();
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [isOpen]);

  const filteredTaxOptions = taxOptions.filter((tax) =>
    tax.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTax = (taxId) => {
    onChange(taxId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearTax = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedTax(null);
  };

  const dropdownPortal = isOpen ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 999999,
      }}
    >
      <div className="rounded-none shadow-xl bg-white border border-[#d7dcf5] w-[280px] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] px-3 py-2.5 bg-[#fafbff]">
          <Search size={14} className="text-[#94a3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="h-8 w-full border-none bg-transparent text-sm text-[#1f2937] outline-none placeholder:text-[#94a3b8]"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
        <div className="py-2 max-h-[400px] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d3d3d3 #f5f5f5' }}>
          <div className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            NON-TAXABLE
          </div>
          {nonTaxableOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelectTax(option.id)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === option.id
                  ? "bg-[#eff6ff] text-[#2563eb] font-medium border-l-2 border-l-[#2563eb]"
                  : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#1f2937]"
              }`}
            >
              <div className="font-medium">{option.name}</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">{option.description}</div>
            </div>
          ))}
          <div className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            TAX GROUP
          </div>
          {filteredTaxOptions.map((tax) => (
            <div
              key={tax.id}
              onClick={() => handleSelectTax(tax.id)}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === tax.id
                  ? "bg-[#f1f5f9] text-[#1f2937] font-medium border-l-2 border-l-[#64748b]"
                  : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#1f2937]"
              }`}
            >
              <span>{tax.display}</span>
              {value === tax.id && <Check size={16} className="text-[#64748b]" />}
            </div>
          ))}
          <div
            onClick={() => {
              onNewTax();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2563eb] hover:bg-[#f8fafc] cursor-pointer transition-colors border-t border-[#e2e8f0] mt-2"
          >
            <Plus size={16} />
            <span>New Tax</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative w-full overflow-visible m-0 p-0">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          type="button"
          className={`w-full rounded-none border border-gray-200 bg-white text-sm transition-colors cursor-pointer flex items-center justify-between focus:border-purple-600 focus:outline-none ${selectedTax ? 'text-gray-900 font-medium' : 'text-gray-400'} ${className || 'h-8 px-2.5 text-xs'}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate text-left">
              {selectedTax ? selectedTax.display || selectedTax.name : placeholder}
            </span>
            {selectedTax && (
              <span
                onClick={handleClearTax}
                className="text-gray-400 hover:text-red-500 transition-colors inline-flex items-center p-0.5 rounded-none hover:bg-red-50 shrink-0 cursor-pointer"
                title="Clear selection"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X size={14} strokeWidth={2} />
              </span>
            )}
          </div>
          <ChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform shrink-0 ml-1.5 ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>
      </div>
      {typeof document !== "undefined" && document.body && createPortal(dropdownPortal, document.body)}
    </>
  );
};

// VendorDropdown Component
const VendorDropdown = ({ value, onChange, onNewVendor }) => {
  const API_URL = baseUrl?.baseUrl?.replace(/\/$/, "") || "http://localhost:7000";
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Fetch vendors from API and localStorage (fallback)
  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);
      try {
        // Get user info
        const userStr = localStorage.getItem("rootfinuser");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?._id || user?.id || user?.email || user?.locCode || null;
        
        let vendorsFromAPI = [];
        
        // Try to fetch from MongoDB API first
        if (userId) {
          try {
            const response = await fetch(`${API_URL}/api/purchase/vendors?userId=${userId}`);
            if (response.ok) {
              const data = await response.json();
              vendorsFromAPI = Array.isArray(data) ? data : [];
            }
          } catch (apiError) {
            console.warn("API fetch failed, trying localStorage:", apiError);
          }
        }
        
        // Fallback to localStorage if API returns no vendors or fails
        let vendorsFromLocalStorage = [];
        try {
          const savedVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
          vendorsFromLocalStorage = Array.isArray(savedVendors) ? savedVendors : [];
        } catch (localError) {
          console.warn("Error reading localStorage:", localError);
        }
        
        // Combine both sources, prioritizing API results
        // Use a Map to avoid duplicates (by displayName or id)
        const vendorMap = new Map();
        
        // Add API vendors first
        vendorsFromAPI.forEach(vendor => {
          const key = vendor.displayName || vendor.companyName || vendor._id || vendor.id;
          if (key) vendorMap.set(key, vendor);
        });
        
        // Add localStorage vendors if not already present
        vendorsFromLocalStorage.forEach(vendor => {
          const key = vendor.displayName || vendor.companyName || vendor.id;
          if (key && !vendorMap.has(key)) {
            vendorMap.set(key, vendor);
          }
        });
        
        setVendors(Array.from(vendorMap.values()));
      } catch (error) {
        console.error("Error loading vendors:", error);
        // Final fallback to localStorage only
        try {
          const savedVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
          setVendors(Array.isArray(savedVendors) ? savedVendors : []);
        } catch {
          setVendors([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
    
    // Listen for custom event when vendor is saved
    const handleVendorSaved = () => {
      loadVendors();
    };
    
    // Also listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "vendors") {
        loadVendors();
      }
    };
    
    window.addEventListener("vendorSaved", handleVendorSaved);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("vendorSaved", handleVendorSaved);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [API_URL]);

  // Set selected vendor from value
  useEffect(() => {
    if (value) {
      if (typeof value === 'object' && value !== null) {
        setSelectedVendor(value);
      } else if (vendors.length > 0) {
        // Support both MongoDB _id and old id format
        const vendor = vendors.find((v) => 
          v._id === value || 
          v.id === value || 
          v.displayName === value || 
          v.companyName === value
        );
        setSelectedVendor(vendor || null);
      }
    } else {
      setSelectedVendor(null);
    }
  }, [value, vendors]);

  const updatePos = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
    });
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen) updatePos();
    setIsOpen((p) => !p);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePos();
      setTimeout(updatePos, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const follow = () => updatePos();
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [isOpen]);

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((vendor) => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = (vendor.displayName || "").toLowerCase();
    const companyName = (vendor.companyName || "").toLowerCase();
    const email = (vendor.email || "").toLowerCase();
    return displayName.includes(searchLower) || companyName.includes(searchLower) || email.includes(searchLower);
  });

  const handleSelectVendor = (vendor) => {
    onChange(vendor);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearVendor = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedVendor(null);
  };

  const dropdownPortal = isOpen ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 999999,
      }}
    >
      <div className="rounded-none shadow-xl bg-white border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 bg-gray-50/70">
          <Search size={13} className="text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="h-6 w-full border-none bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
        <div className="py-1 max-h-[280px] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d3d3d3 #f5f5f5' }}>
          {loading ? (
            <div className="px-4 py-4 text-center text-xs text-gray-500">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="px-4 py-4 text-center text-xs text-gray-500">
              {searchTerm ? "No vendors found" : "No vendors available"}
            </div>
          ) : (
            filteredVendors.map((vendor) => {
              const vendorId = vendor._id || vendor.id;
              const isSelected = Boolean(
                value && (
                  (typeof value === 'object' && value !== null && (
                    (vendorId && (value._id === vendorId || value.id === vendorId)) ||
                    (vendor.displayName && value.displayName === vendor.displayName)
                  )) ||
                  (typeof value === 'string' && value.trim() !== "" && (
                    value === vendorId ||
                    value === vendor.displayName ||
                    value === vendor.companyName
                  ))
                )
              );
              
              return (
                <div
                  key={vendor._id || vendor.id}
                  onClick={() => handleSelectVendor(vendor)}
                  className={`px-4 py-2.5 cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? "bg-[#9333ea] text-white font-medium"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                  }`}
                >
                  <div className="truncate">
                    {vendor.displayName || vendor.companyName || "Unnamed Vendor"}
                  </div>
                </div>
              );
            })
          )}
          <div
            onClick={() => {
              onNewVendor();
              setIsOpen(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors border-t border-gray-100 font-medium"
          >
            <Plus size={14} />
            <span>Add New Vendor</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative w-full overflow-visible m-0 p-0">
        <div className="relative">
          <input
            ref={buttonRef}
            onClick={toggleDropdown}
            type="text"
            readOnly
            value={selectedVendor ? (selectedVendor.displayName || selectedVendor.companyName || "") : ""}
            placeholder="Type or click to select a vendor"
            className={`w-full h-9 rounded-none border ${
              isOpen ? "border-purple-600 ring-1 ring-purple-600" : "border-gray-200"
            } bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 transition-colors cursor-pointer px-3 py-2 pr-8`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {selectedVendor && (
              <button
                onClick={handleClearVendor}
                className="text-gray-400 hover:text-red-500 transition-colors inline-flex items-center bg-transparent border-none p-0.5 rounded-none hover:bg-red-50 shrink-0 m-0 cursor-pointer"
                type="button"
                title="Clear selection"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
            <ChevronDown 
              size={14} 
              className={`text-gray-500 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
      {typeof document !== "undefined" && document.body && createPortal(dropdownPortal, document.body)}
    </>
  );
};

// ItemDropdown Component
const ItemDropdown = ({
  rowId,
  value,
  description,
  onDescriptionChange,
  onChange,
  onNewItem,
  onOpenGroupModal,
  warehouse,
}) => {
  const API_URL = baseUrl?.baseUrl?.replace(/\/$/, "") || "http://localhost:7000";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/shoe-sales/items?page=1&limit=100`);
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        let itemsList = [];
        if (Array.isArray(data)) {
          itemsList = data;
        } else if (data.items && Array.isArray(data.items)) {
          itemsList = data.items;
        }
        const activeItems = itemsList.filter((i) => i?.isActive !== false && String(i?.isActive).toLowerCase() !== "false");
        setItems(activeItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (value) {
      if (typeof value === "object" && value !== null) {
        setInputValue(value.itemName || "");
      } else if (typeof value === "string") {
        setInputValue(value);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const updatePos = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    updatePos();
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectItem = (item) => {
    onChange(item);
    setInputValue(item.itemName || "");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePos();
      setTimeout(updatePos, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const follow = () => updatePos();
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    const searchLower = (inputValue || "").toLowerCase();
    const itemName = (item.itemName || "").toLowerCase();
    const sku = (item.sku || "").toLowerCase();
    return itemName.includes(searchLower) || sku.includes(searchLower);
  });

  const getStockOnHand = (item, selectedWarehouse) => {
    if (!item.warehouseStocks || !Array.isArray(item.warehouseStocks)) return 0;
    
    if (!selectedWarehouse || selectedWarehouse === "All Stores") {
      return item.warehouseStocks.reduce((sum, ws) => {
        const stock = typeof ws.stockOnHand === "number" ? ws.stockOnHand : 0;
        return sum + stock;
      }, 0);
    }
    
    const warehouseStock = item.warehouseStocks.find((ws) => {
      if (!ws.warehouse) return false;
      const wsWarehouse = ws.warehouse.toString().toLowerCase().trim();
      const selectedWarehouseLower = selectedWarehouse.toLowerCase().trim();
      if (wsWarehouse === selectedWarehouseLower) return true;
      const normalizedWs = mapWarehouse(ws.warehouse);
      const normalizedSelected = mapWarehouse(selectedWarehouse);
      if (normalizedWs && normalizedSelected) {
        return normalizedWs.toLowerCase().trim() === normalizedSelected.toLowerCase().trim();
      }
      return false;
    });
    
    return warehouseStock ? (typeof warehouseStock.stockOnHand === "number" ? warehouseStock.stockOnHand : 0) : 0;
  };

  const dropdownPortal = isOpen ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 999999,
      }}
    >
      <div className="rounded-none shadow-xl bg-white border border-gray-200 overflow-hidden">
        <div className="py-1 max-h-[260px] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "#d3d3d3 #f5f5f5" }}>
          {loading ? (
            <div className="px-4 py-3 text-center text-xs text-gray-500">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-gray-500">
              {inputValue ? "No matching catalog items (custom name will be used)" : "No items available"}
            </div>
          ) : (
            filteredItems.map((item) => {
              const stockOnHand = getStockOnHand(item, warehouse);
              const itemId = item._id || item.id;
              const isSelected = Boolean(
                value && (
                  (typeof value === "object" && value !== null && (
                    (itemId && (value._id === itemId || value.id === itemId)) ||
                    (item.itemName && value.itemName === item.itemName)
                  )) ||
                  (typeof value === "string" && value.trim() !== "" && (
                    value === itemId ||
                    value === item.itemName
                  ))
                )
              );
              
              return (
                <div
                  key={item._id || item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`px-4 py-2.5 cursor-pointer text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-[#9333ea] text-white font-medium"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                  }`}
                >
                  <div className="truncate flex-1 min-w-0 mr-2">
                    <div className="truncate font-medium">{item.itemName || "Unnamed Item"}</div>
                    {item.sku && <div className={`text-[10px] ${isSelected ? "text-white/80" : "text-gray-400"}`}>SKU: {item.sku}</div>}
                  </div>
                  <div className={`text-[11px] shrink-0 ${isSelected ? "text-white" : "text-gray-500"}`}>
                    {stockOnHand.toFixed(0)} pcs
                  </div>
                </div>
              );
            })
          )}
          {onOpenGroupModal && (
            <div
              onClick={() => {
                onOpenGroupModal();
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-purple-700 hover:bg-purple-50 cursor-pointer transition-colors border-t border-gray-100 font-semibold"
            >
              <Layers size={14} className="text-purple-600" />
              <span>Group Item</span>
            </div>
          )}
          <div
            onClick={() => {
              onNewItem();
              setIsOpen(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors border-t border-gray-100 font-medium"
          >
            <Plus size={14} />
            <span>Add New Item Master</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div ref={containerRef} className="relative w-full overflow-visible m-0 p-0">
        <div
          className={`w-full h-8 rounded-none border ${
            isOpen ? "border-purple-600 ring-1 ring-purple-600" : "border-gray-200"
          } bg-white px-2.5 flex items-center justify-between text-xs text-gray-800 hover:border-purple-300 focus-within:border-purple-600 transition-colors`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              updatePos();
              setIsOpen(true);
            }}
            placeholder="Type or select an item..."
            className="w-full h-full border-none bg-transparent p-0 text-xs text-gray-900 focus:outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1 shrink-0 ml-1.5">
            {inputValue && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue("");
                  onChange(null);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-none hover:bg-red-50 cursor-pointer"
                title="Clear item"
              >
                <X size={13} />
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updatePos();
                setIsOpen(!isOpen);
              }}
              className="text-gray-400 hover:text-gray-600 transition-transform p-0.5 cursor-pointer"
            >
              <ChevronDown size={13} className={`${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>
      {typeof document !== "undefined" && document.body && createPortal(dropdownPortal, document.body)}
    </>
  );
};

// Indian States List for Supply
const SUPPLY_STATE_OPTIONS = [
  { code: "KL", name: "Kerala", value: "[KL] - Kerala" },
  { code: "TN", name: "Tamil Nadu", value: "[TN] - Tamil Nadu" },
  { code: "KA", name: "Karnataka", value: "[KA] - Karnataka" },
  { code: "MH", name: "Maharashtra", value: "[MH] - Maharashtra" },
  { code: "DL", name: "Delhi", value: "[DL] - Delhi" },
  { code: "GJ", name: "Gujarat", value: "[GJ] - Gujarat" },
  { code: "RJ", name: "Rajasthan", value: "[RJ] - Rajasthan" },
  { code: "UP", name: "Uttar Pradesh", value: "[UP] - Uttar Pradesh" },
  { code: "WB", name: "West Bengal", value: "[WB] - West Bengal" },
  { code: "AP", name: "Andhra Pradesh", value: "[AP] - Andhra Pradesh" },
  { code: "TS", name: "Telangana", value: "[TS] - Telangana" },
  { code: "AR", name: "Arunachal Pradesh", value: "[AR] - Arunachal Pradesh" },
  { code: "AS", name: "Assam", value: "[AS] - Assam" },
  { code: "BR", name: "Bihar", value: "[BR] - Bihar" },
  { code: "CG", name: "Chhattisgarh", value: "[CG] - Chhattisgarh" },
  { code: "GA", name: "Goa", value: "[GA] - Goa" },
  { code: "HR", name: "Haryana", value: "[HR] - Haryana" },
  { code: "HP", name: "Himachal Pradesh", value: "[HP] - Himachal Pradesh" },
  { code: "JH", name: "Jharkhand", value: "[JH] - Jharkhand" },
  { code: "MP", name: "Madhya Pradesh", value: "[MP] - Madhya Pradesh" },
  { code: "MN", name: "Manipur", value: "[MN] - Manipur" },
  { code: "ML", name: "Meghalaya", value: "[ML] - Meghalaya" },
  { code: "MZ", name: "Mizoram", value: "[MZ] - Mizoram" },
  { code: "NL", name: "Nagaland", value: "[NL] - Nagaland" },
  { code: "OR", name: "Odisha", value: "[OR] - Odisha" },
  { code: "PB", name: "Punjab", value: "[PB] - Punjab" },
  { code: "SK", name: "Sikkim", value: "[SK] - Sikkim" },
  { code: "TR", name: "Tripura", value: "[TR] - Tripura" },
  { code: "UK", name: "Uttarakhand", value: "[UK] - Uttarakhand" },
  { code: "AN", name: "Andaman and Nicobar Islands", value: "[AN] - Andaman and Nicobar Islands" },
  { code: "CH", name: "Chandigarh", value: "[CH] - Chandigarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", value: "[DN] - Dadra and Nagar Haveli and Daman and Diu" },
  { code: "JK", name: "Jammu and Kashmir", value: "[JK] - Jammu and Kashmir" },
  { code: "LA", name: "Ladakh", value: "[LA] - Ladakh" },
  { code: "LD", name: "Lakshadweep", value: "[LD] - Lakshadweep" },
  { code: "PY", name: "Puducherry", value: "[PY] - Puducherry" },
];

const normalizeSupplyState = (input) => {
  if (!input) return "";
  const trimmed = input.toString().trim();
  const exact = SUPPLY_STATE_OPTIONS.find(
    (s) =>
      s.value.toLowerCase() === trimmed.toLowerCase() ||
      s.name.toLowerCase() === trimmed.toLowerCase() ||
      s.code.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact.value;
  const partial = SUPPLY_STATE_OPTIONS.find(
    (s) =>
      trimmed.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(trimmed.toLowerCase())
  );
  if (partial) return partial.value;
  return trimmed;
};

const NewBillForm = ({ billId, isEditMode = false }) => {
  const isSidebarOpen = useSidebar();
  const navigate = useNavigate();
  const API_URL = baseUrl?.baseUrl?.replace(/\/$/, "") || "http://localhost:7000";
  const [vendorName, setVendorName] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [sourceOfSupply, setSourceOfSupply] = useState("");
  const [destinationOfSupply, setDestinationOfSupply] = useState("[KL] - Kerala");
  const [branch, setBranch] = useState("Warehouse");
  const [saving, setSaving] = useState(false);
  const [loadingBill, setLoadingBill] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const billDateInputRef = useRef(null);
  const dueDateInputRef = useRef(null);
  const [warehouse, setWarehouse] = useState("Warehouse");
  const [discount, setDiscount] = useState({ value: "0", type: "%" });
  const [applyDiscountAfterTax, setApplyDiscountAfterTax] = useState(false);
  const [totalTaxAmount, setTotalTaxAmount] = useState("");
  const [tdsTcsType, setTdsTcsType] = useState(""); // "TDS" or "TCS"
  const [tdsTcsTax, setTdsTcsTax] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [showNewTaxModal, setShowNewTaxModal] = useState(false);
  const [newTax, setNewTax] = useState({
    name: "",
    rate: "",
    type: "",
  });
  const [taxOptions, setTaxOptions] = useState([
    { id: "gst0", name: "GST0", rate: 0, display: "GST0 [0%]" },
    { id: "gst5", name: "GST5", rate: 5, display: "GST5 [5%]" },
    { id: "gst12", name: "GST12", rate: 12, display: "GST12 [12%]" },
    { id: "gst18", name: "GST18", rate: 18, display: "GST18 [18%]" },
    { id: "gst28", name: "GST28", rate: 28, display: "GST28 [28%]" },
  ]);
  const [nonTaxableOptions] = useState([
    {
      id: "out-of-scope",
      name: "Out of Scope",
      description: "Supplies on which you don't charge any GST or include them in the returns.",
    },
    {
      id: "non-gst-supply",
      name: "Non-GST Supply",
      description: "Supplies which do not come under GST such as petroleum products and liquor.",
    },
  ]);
  const [tdsOptions] = useState([
    { id: "tds-commission", name: "Commission or Brokerage", rate: 5, display: "Commission or Brokerage [5%]" },
    { id: "tds-commission-reduced", name: "Commission or Brokerage (Reduced)", rate: 3.75, display: "Commission or Brokerage (Reduced) [3.75%]" },
    { id: "tds-dividend", name: "Dividend", rate: 10, display: "Dividend [10%]" },
    { id: "tds-dividend-reduced", name: "Dividend (Reduced)", rate: 7.5, display: "Dividend (Reduced) [7.5%]" },
    { id: "tds-other-interest", name: "Other Interest than securities", rate: 10, display: "Other Interest than securities [10%]" },
    { id: "tds-other-interest-reduced", name: "Other Interest than securities (Reduced)", rate: 7.5, display: "Other Interest than securities (Reduced) [7.5%]" },
    { id: "tds-contractors-others", name: "Payment of contractors for Others", rate: 2, display: "Payment of contractors for Others [2%]" },
    { id: "tds-contractors-others-reduced", name: "Payment of contractors for Others (Reduced)", rate: 1.5, display: "Payment of contractors for Others (Reduced) [1.5%]" },
    { id: "tds-contractors-huf", name: "Payment of contractors HUF/Indiv", rate: 1, display: "Payment of contractors HUF/Indiv [1%]" },
    { id: "tds-contractors-huf-reduced", name: "Payment of contractors HUF/Indiv (Reduced)", rate: 0.75, display: "Payment of contractors HUF/Indiv (Reduced) [0.75%]" },
    { id: "tds-professional-fees", name: "Professional Fees", rate: 10, display: "Professional Fees [10%]" },
    { id: "tds-professional-fees-reduced", name: "Professional Fees (Reduced)", rate: 7.5, display: "Professional Fees (Reduced) [7.5%]" },
    { id: "tds-rent", name: "Rent on land or furniture etc", rate: 10, display: "Rent on land or furniture etc [10%]" },
    { id: "tds-rent-reduced", name: "Rent on land or furniture etc (Reduced)", rate: 7.5, display: "Rent on land or furniture etc (Reduced) [7.5%]" },
    { id: "tds-technical-fees", name: "Technical Fees (2%)", rate: 2, display: "Technical Fees (2%) [2%]" },
  ]);
  const [tableRows, setTableRows] = useState([
    {
      id: 1,
      item: "",
      itemData: null,
      itemDescription: "",
      sku: "",
      hsnCode: "",
      size: "",
      quantity: "1.00",
      rate: "0.00",
      sellingPrice: "0.00",
      mrp: "0.00",
      percentage: "",
      tax: "",
      customer: "",
      amount: "0.00",
      baseAmount: "0.00",
      discountedAmount: "0.00",
      cgstAmount: "0.00",
      sgstAmount: "0.00",
      igstAmount: "0.00",
      lineTaxTotal: "0.00",
      lineTotal: "0.00",
      taxCode: "",
      taxPercent: 0,
      cgstPercent: 0,
      sgstPercent: 0,
      igstPercent: 0,
      isInterState: false,
    },
  ]);
  const [attachments, setAttachments] = useState([]);

  // Bulk Add Items states
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkScanInput, setBulkScanInput] = useState("");
  const [bulkScannedItems, setBulkScannedItems] = useState([]); // Array of {item, quantity, sku}
  const [bulkItems, setBulkItems] = useState([]); // All items for bulk add modal
  const [bulkItemsLoading, setBulkItemsLoading] = useState(false);
  const bulkScanInputRef = useRef(null);
  const bulkScanBufferRef = useRef("");
  const bulkScanTimeoutRef = useRef(null);

  // Add Item to Group Modal state
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [activeGroupRow, setActiveGroupRow] = useState(null);
  const [groupOption, setGroupOption] = useState("existing"); // "existing" | "new"
  const [existingGroups, setExistingGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupUnit, setNewGroupUnit] = useState("PCS");
  const [groupModalItemName, setGroupModalItemName] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);

  // Group Item (Batch Add) Modal state
  const [showGroupItemModal, setShowGroupItemModal] = useState(false);
  const [groupModalBatchOption, setGroupModalBatchOption] = useState("existing"); // "existing" | "new"
  const [groupModalBatchGroupId, setGroupModalBatchGroupId] = useState("");
  const [groupModalBatchNewName, setGroupModalBatchNewName] = useState("");
  const [groupModalBatchUnit, setGroupModalBatchUnit] = useState("PCS");
  const [groupModalBatchItemName, setGroupModalBatchItemName] = useState("");
  const [groupModalBatchHsn, setGroupModalBatchHsn] = useState("");
  const [groupModalBatchQuantity, setGroupModalBatchQuantity] = useState("10");
  const [groupModalBatchTax, setGroupModalBatchTax] = useState("");
  const [groupModalBatchCost, setGroupModalBatchCost] = useState("0.00");
  const [groupModalBatchSelling, setGroupModalBatchSelling] = useState("0.00");
  const [groupModalBatchSize, setGroupModalBatchSize] = useState("");
  const [groupModalBatchSkuPrefix, setGroupModalBatchSkuPrefix] = useState("");

  // Calculate GST for a single line item (Inclusive GST)
  const calculateGSTLineItem = (row, discountConfig, allTaxOptions, totalBaseAmount = 0) => {
    const quantity = parseFloat(row.quantity) || 0;
    const rate = parseFloat(row.rate) || 0;
    const totalAmount = quantity * rate;
    const roundedTotalAmount = parseFloat(totalAmount.toFixed(2));

    const extractTaxRate = (taxRateValue) => {
      if (!taxRateValue) return null;
      const taxRateStr = String(taxRateValue);
      const bracketMatch = taxRateStr.match(/\[(\d+(?:\.\d+)?)%?\]/);
      if (bracketMatch) {
        return parseFloat(bracketMatch[1]);
      }
      const numberMatch = taxRateStr.replace(/[^\d.]/g, '');
      const taxRate = parseFloat(numberMatch);
      return isNaN(taxRate) ? null : taxRate;
    };

    const selectedTax = allTaxOptions.find(t => t.id === row.tax);
    
    let taxPercent = 0;
    let cgstPercent = 0;
    let sgstPercent = 0;
    let igstPercent = 0;
    let isInterState = false;
    let taxCode = "";

    // ✅ PRIORITY: Manual tax selection overrides item's default tax
    // Only use item's default tax if user hasn't manually selected a tax
    if (selectedTax && selectedTax.rate !== undefined && selectedTax.rate > 0) {
      // User manually selected a tax - use it
      taxPercent = selectedTax.rate;
      taxCode = selectedTax.id;
      isInterState = false;
    } else if (row.tax) {
      // User selected a tax but it's not in allTaxOptions - try to extract from item data
      const itemData = row.itemData;
      let itemTaxRate = null;
      let itemIsInterState = false;

      if (itemData) {
        if (itemData.taxRateIntra) {
          itemTaxRate = extractTaxRate(itemData.taxRateIntra);
          itemIsInterState = false;
        } else if (itemData.taxRateInter) {
          itemTaxRate = extractTaxRate(itemData.taxRateInter);
          itemIsInterState = true;
        }
      }

      if (itemTaxRate !== null) {
        taxPercent = itemTaxRate;
        isInterState = itemIsInterState;
        taxCode = itemData.taxRateIntra || itemData.taxRateInter || row.tax || "";
      }
    }
    // If no tax selected (row.tax is empty/null), taxPercent remains 0 and no GST is calculated

    if (taxPercent > 0) {
      if (isInterState) {
        igstPercent = taxPercent;
      } else {
        cgstPercent = taxPercent / 2;
        sgstPercent = taxPercent / 2;
      }
    }

    // INCLUSIVE GST LOGIC:
    // The Cost Price already includes tax, so base amount is extracted from totalAmount
    let baseAmount = roundedTotalAmount;
    let lineTaxTotal = 0;

    if (taxPercent > 0) {
      // Base amount = Total / (1 + taxPercent / 100)
      baseAmount = parseFloat((roundedTotalAmount / (1 + taxPercent / 100)).toFixed(2));
      // Tax is the difference between total inclusive amount and base amount
      lineTaxTotal = parseFloat((roundedTotalAmount - baseAmount).toFixed(2));
    }

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxPercent > 0) {
      if (isInterState && igstPercent > 0) {
        igstAmount = lineTaxTotal;
      } else if (!isInterState && (cgstPercent > 0 || sgstPercent > 0)) {
        cgstAmount = parseFloat((lineTaxTotal / 2).toFixed(2));
        sgstAmount = parseFloat((lineTaxTotal - cgstAmount).toFixed(2));
      }
    }

    let discountedAmount = roundedTotalAmount;
    const rawDiscountVal = parseFloat(discountConfig.value);
    const discountVal = isNaN(rawDiscountVal) ? 0 : Math.abs(rawDiscountVal);

    if (!discountConfig.applyAfterTax && discountVal > 0) {
      if (discountConfig.type === "%") {
        discountedAmount = roundedTotalAmount - (roundedTotalAmount * discountVal / 100);
      } else {
        const lineDiscount = totalBaseAmount > 0 ? (roundedTotalAmount / totalBaseAmount) * discountVal : 0;
        discountedAmount = Math.max(0, roundedTotalAmount - lineDiscount);
      }
      discountedAmount = parseFloat(discountedAmount.toFixed(2));
    }

    // For inclusive GST, line total is the inclusive amount (after discount if any)
    const lineTotal = discountedAmount;

    return {
      baseAmount: baseAmount.toFixed(2),
      discountedAmount: discountedAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      igstAmount: igstAmount.toFixed(2),
      lineTaxTotal: lineTaxTotal.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
      taxCode,
      taxPercent,
      cgstPercent,
      sgstPercent,
      igstPercent,
      isInterState,
    };
  };

  const handleUpdateRow = (rowId, field, value) => {
    setTableRows(
      tableRows.map((row) => {
        if (row.id === rowId) {
          const updated = { ...row, [field]: value };
          
          if (field === "item" && typeof value === 'object' && value !== null) {
            updated.itemData = value;
            updated.item = value.itemName || value._id || "";
            
            if (value.sku && !updated.sku) {
              updated.sku = value.sku;
            }

            if (value.hsnCode && !updated.hsnCode) {
              updated.hsnCode = value.hsnCode;
            }

            if (value.costPrice !== undefined && value.costPrice !== null && (!updated.rate || updated.rate === "0.00" || updated.rate === "0")) {
              updated.rate = value.costPrice.toString();
            } else if (value.purchasePrice !== undefined && value.purchasePrice !== null && (!updated.rate || updated.rate === "0.00" || updated.rate === "0")) {
              updated.rate = value.purchasePrice.toString();
            }

            if (value.sellingPrice !== undefined && value.sellingPrice !== null && (!updated.sellingPrice || updated.sellingPrice === "0.00" || updated.sellingPrice === "0")) {
              updated.sellingPrice = value.sellingPrice.toString();
            }

            if (value.mrp !== undefined && value.mrp !== null && (!updated.mrp || updated.mrp === "0.00" || updated.mrp === "0")) {
              updated.mrp = value.mrp.toString();
            } else if (value.sellingPrice !== undefined && value.sellingPrice !== null && (!updated.mrp || updated.mrp === "0.00" || updated.mrp === "0")) {
              updated.mrp = value.sellingPrice.toString();
            }
            
            if (value.size && !updated.size) {
              updated.size = value.size;
            }
            
            // Handle size for group items (stored in attributeCombination)
            if (!updated.size && value.attributeCombination && Array.isArray(value.attributeCombination)) {
              // For group items, try to find size in attributeCombination
              // Look for common size patterns
              const sizeValue = value.attributeCombination.find(attr => {
                if (!attr) return false;
                const attrStr = String(attr).trim();
                
                // Check for numeric sizes (shoe sizes, clothing sizes)
                if (/^\d+(\.\d+)?$/.test(attrStr)) {
                  const num = parseFloat(attrStr);
                  // Shoe sizes (6-15) or clothing sizes (28-50)
                  if ((num >= 6 && num <= 15) || (num >= 28 && num <= 50)) {
                    return true;
                  }
                }
                
                // Check for standard clothing sizes
                if (/^(xs|s|m|l|xl|xxl|xxxl)$/i.test(attrStr)) {
                  return true;
                }
                
                // Check for size with units (like "8 UK", "M Size", etc.)
                if (/\b(size|sz|uk|us|eu)\b/i.test(attrStr)) {
                  return true;
                }
                
                return false;
              });
              
              if (sizeValue) {
                updated.size = String(sizeValue);
              }
            }
            
            // Do not automatically fetch or set tax when item is added
            // User must manually select tax if needed
            // This prevents double GST calculation for inclusive prices
          }

          // Dynamic calculation: Selling Price = Cost Price * (Percentage / 100)
          if (field === "percentage") {
            const costPrice = parseFloat(updated.rate) || 0;
            const pctVal = parseFloat(String(value).replace("%", "").trim());
            if (!isNaN(pctVal) && costPrice > 0) {
              const calculatedSellingPrice = parseFloat(((costPrice * pctVal) / 100).toFixed(2));
              updated.sellingPrice = isNaN(calculatedSellingPrice) ? "0.00" : calculatedSellingPrice.toFixed(2);
              if (!updated.mrp || updated.mrp === "0.00" || updated.mrp === "0") {
                updated.mrp = updated.sellingPrice;
              }
            }
          }

          if (field === "rate") {
            if (updated.percentage !== undefined && updated.percentage !== null && String(updated.percentage).trim() !== "") {
              const pctVal = parseFloat(String(updated.percentage).replace("%", "").trim());
              const costPrice = parseFloat(value) || 0;
              if (!isNaN(pctVal) && costPrice > 0) {
                const calculatedSellingPrice = parseFloat(((costPrice * pctVal) / 100).toFixed(2));
                updated.sellingPrice = isNaN(calculatedSellingPrice) ? "0.00" : calculatedSellingPrice.toFixed(2);
                if (!updated.mrp || updated.mrp === "0.00" || updated.mrp === "0") {
                  updated.mrp = updated.sellingPrice;
                }
              }
            }
          }
          
          // If tax is manually changed (not when item is selected), prioritize the manually selected tax
          // Clear itemData tax preference so that manually selected tax is used instead
          if (field === "tax" && updated.itemData) {
            // When user manually changes tax, ignore item's default tax and use the manually selected one
            // Create a copy of itemData without tax info to force using selected tax
            updated.itemData = {
              ...updated.itemData,
              taxRateIntra: null,
              taxRateInter: null,
              taxPreference: null
            };
          }
          
          const allTaxOptions = [...taxOptions, ...nonTaxableOptions];
          const discountConfig = {
            value: discount.value,
            type: discount.type,
            applyAfterTax: applyDiscountAfterTax,
          };
          const totalBase = tableRows.reduce((sum, r) => {
            const rowItem = r.id === rowId ? updated : r;
            return sum + ((parseFloat(rowItem.quantity) || 0) * (parseFloat(rowItem.rate) || 0));
          }, 0);
          const gstCalculation = calculateGSTLineItem(updated, discountConfig, allTaxOptions, totalBase);
          
          updated.baseAmount = gstCalculation.baseAmount;
          updated.discountedAmount = gstCalculation.discountedAmount;
          updated.cgstAmount = gstCalculation.cgstAmount;
          updated.sgstAmount = gstCalculation.sgstAmount;
          updated.igstAmount = gstCalculation.igstAmount;
          updated.lineTaxTotal = gstCalculation.lineTaxTotal;
          updated.lineTotal = gstCalculation.lineTotal;
          updated.taxCode = gstCalculation.taxCode;
          updated.taxPercent = gstCalculation.taxPercent;
          updated.cgstPercent = gstCalculation.cgstPercent;
          updated.sgstPercent = gstCalculation.sgstPercent;
          updated.igstPercent = gstCalculation.igstPercent;
          updated.isInterState = gstCalculation.isInterState;
          updated.amount = gstCalculation.baseAmount;
          
          return updated;
        }
        return row;
      })
    );
  };

  useEffect(() => {
    if (tableRows.length === 0) return;
    
    const allTaxOptions = [...taxOptions, ...nonTaxableOptions];
    const discountConfig = {
      value: discount.value,
      type: discount.type,
      applyAfterTax: applyDiscountAfterTax,
    };

    const totalBase = tableRows.reduce((sum, r) => {
      return sum + ((parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0));
    }, 0);

    setTableRows(prevRows => 
      prevRows.map(row => {
        const gstCalculation = calculateGSTLineItem(row, discountConfig, allTaxOptions, totalBase);
        return {
          ...row,
          ...gstCalculation,
          amount: gstCalculation.baseAmount,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount.value, discount.type, applyDiscountAfterTax]);


  const handleAddNewRow = () => {
    const newRow = {
      id: Date.now(),
      item: "",
      itemData: null,
      itemDescription: "",
      sku: "",
      hsnCode: "",
      size: "",
      quantity: "1.00",
      rate: "0.00",
      sellingPrice: "0.00",
      mrp: "0.00",
      percentage: "",
      tax: "",
      customer: "",
      amount: "0.00",
      baseAmount: "0.00",
      discountedAmount: "0.00",
      cgstAmount: "0.00",
      sgstAmount: "0.00",
      igstAmount: "0.00",
      lineTaxTotal: "0.00",
      lineTotal: "0.00",
      taxCode: "",
      taxPercent: 0,
      cgstPercent: 0,
      sgstPercent: 0,
      igstPercent: 0,
      isInterState: false,
    };
    setTableRows([...tableRows, newRow]);
  };

  const handleDeleteRow = (rowId) => {
    if (tableRows.length > 1) {
      // If there are multiple rows, just remove the selected row
      setTableRows(tableRows.filter((row) => row.id !== rowId));
    } else {
      // If it's the last row, replace it with a blank row instead of deleting
      const newRow = {
        id: Date.now(),
        item: "",
        itemData: null,
        itemDescription: "",
        sku: "",
        hsnCode: "",
        size: "",
        quantity: "1.00",
        rate: "0.00",
        sellingPrice: "0.00",
        mrp: "0.00",
        percentage: "",
        tax: "",
        customer: "",
        amount: "0.00",
        baseAmount: "0.00",
        discountedAmount: "0.00",
        cgstAmount: "0.00",
        sgstAmount: "0.00",
        igstAmount: "0.00",
        lineTaxTotal: "0.00",
        lineTotal: "0.00",
        taxCode: "",
        taxPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        igstPercent: 0,
        isInterState: false,
      };
      setTableRows([newRow]);
    }
  };

  // Bulk Add Items functions
  const fetchBulkItems = async () => {
    setBulkItemsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/shoe-sales/items?page=1&limit=10000`);
      let itemsList = [];
      if (response.ok) {
        const data = await response.json();
        itemsList = Array.isArray(data) ? data : (data.items || data.data || []);
      }
      
      // Filter active items
      const activeItems = itemsList.filter((i) => i?.isActive !== false && String(i?.isActive).toLowerCase() !== "false");
      setBulkItems(activeItems);
    } catch (error) {
      console.error("Error fetching bulk items:", error);
      setBulkItems([]);
    } finally {
      setBulkItemsLoading(false);
    }
  };

  const handleBulkAddClose = () => {
    setShowBulkAddModal(false);
    setBulkScannedItems([]);
    setBulkScanInput("");
    bulkScanBufferRef.current = "";
  };

  const handleBulkScanKeyDown = async (e) => {
    if (bulkScanTimeoutRef.current) {
      clearTimeout(bulkScanTimeoutRef.current);
    }
    
    const char = e.key;
    
    if (char === "Enter") {
      e.preventDefault();
      const scannedCode = bulkScanBufferRef.current.trim();
      
      if (scannedCode.length > 0) {
        await processBulkScan(scannedCode);
        bulkScanBufferRef.current = "";
        setBulkScanInput("");
      }
      return;
    }
    
    if (char.length > 1) {
      return;
    }
    
    bulkScanBufferRef.current += char;
    setBulkScanInput(bulkScanBufferRef.current);
    
    bulkScanTimeoutRef.current = setTimeout(() => {
      bulkScanBufferRef.current = "";
    }, 100);
  };

  const processBulkScan = async (scannedCode) => {
    console.log(`📱 Bulk scan: "${scannedCode}"`);
    
    try {
      if (bulkItems.length === 0) {
        console.log("⚠️ No items loaded yet");
        alert("Items are still loading. Please wait.");
        return;
      }
      
      const foundItem = bulkItems.find(item => 
        item.sku && item.sku.toLowerCase() === scannedCode.toLowerCase()
      );
      
      if (foundItem) {
        console.log(`✅ Found item:`, foundItem);
        
        // Get available stock for this item from the selected warehouse
        let availableStock = 0;
        if (foundItem.warehouseStocks && Array.isArray(foundItem.warehouseStocks)) {
          if (!warehouse || warehouse === "All Stores") {
            // Show total stock from all warehouses
            const totalStock = foundItem.warehouseStocks.reduce((sum, ws) => {
              return sum + (parseFloat(ws.availableForSale) || parseFloat(ws.stockOnHand) || 0);
            }, 0);
            availableStock = totalStock;
          } else {
            // Find stock for the specific warehouse
            const warehouseStock = foundItem.warehouseStocks.find(ws => {
              if (!ws.warehouse) return false;
              
              // Normalize warehouse names for comparison
              const wsWarehouse = ws.warehouse.toString().toLowerCase().trim();
              const selectedWarehouse = warehouse.toLowerCase().trim();
              
              // Direct match
              if (wsWarehouse === selectedWarehouse) return true;
              
              // Handle warehouse mapping variations
              const normalizedWs = mapWarehouse(ws.warehouse);
              const normalizedSelected = mapWarehouse(warehouse);
              
              if (normalizedWs && normalizedSelected) {
                return normalizedWs.toLowerCase().trim() === normalizedSelected.toLowerCase().trim();
              }
              
              return false;
            });
            
            availableStock = warehouseStock ? (parseFloat(warehouseStock.availableForSale) || parseFloat(warehouseStock.stockOnHand) || 0) : 0;
          }
        }
        
        console.log(`📊 Available stock for ${foundItem.itemName}: ${availableStock}`);
        
        setBulkScannedItems(prev => {
          const existingIndex = prev.findIndex(i => i.item._id === foundItem._id);
          
          if (existingIndex >= 0) {
            const currentQuantity = prev[existingIndex].quantity;
            if (currentQuantity >= availableStock) {
              alert(`❌ Cannot add more. Only ${availableStock} pcs available for ${foundItem.itemName}`);
              return prev;
            }
            
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1
            };
            console.log(`📈 Incremented quantity for ${foundItem.itemName} to ${updated[existingIndex].quantity}`);
            return updated;
          } else {
            if (availableStock <= 0) {
              alert(`❌ No stock available for ${foundItem.itemName}`);
              return prev;
            }
            
            console.log(`➕ Added new item ${foundItem.itemName}`);
            return [...prev, {
              item: foundItem,
              quantity: 1,
              sku: foundItem.sku
            }];
          }
        });
      } else {
        console.log(`❌ Item not found for SKU: "${scannedCode}"`);
        alert(`Item with SKU "${scannedCode}" not found`);
      }
    } catch (error) {
      console.error("Error processing bulk scan:", error);
      alert("Error finding item. Please try again.");
    }
  };

  const handleBulkAddItems = () => {
    if (bulkScannedItems.length === 0) {
      alert("Please scan at least one item");
      return;
    }
    
    // Remove blank row if exists
    const filtered = tableRows.filter(row => row.item && row.item.trim() !== "");
    
    // Add scanned items to table
    const newRows = bulkScannedItems.map((scanned, idx) => {
      const newId = Math.max(...filtered.map(r => r.id), 0) + idx + 1;
      return {
        id: newId,
        item: scanned.item.itemName,
        itemData: scanned.item,
        itemDescription: "",
        sku: scanned.item.sku || "",
        hsnCode: scanned.item.hsnCode || "",
        size: "",
        quantity: scanned.quantity.toString(),
        rate: (scanned.item.costPrice || "0.00").toString(),
        sellingPrice: (scanned.item.sellingPrice || "0.00").toString(),
        mrp: (scanned.item.mrp || scanned.item.sellingPrice || scanned.item.costPrice || "0.00").toString(),
        percentage: "",
        tax: "",
        customer: "",
        amount: (scanned.quantity * (scanned.item.costPrice || 0)).toFixed(2),
        baseAmount: (scanned.quantity * (scanned.item.costPrice || 0)).toFixed(2),
        discountedAmount: (scanned.quantity * (scanned.item.costPrice || 0)).toFixed(2),
        cgstAmount: "0.00",
        sgstAmount: "0.00",
        igstAmount: "0.00",
        lineTaxTotal: "0.00",
        lineTotal: (scanned.quantity * (scanned.item.costPrice || 0)).toFixed(2),
        taxCode: "",
        taxPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        igstPercent: 0,
        isInterState: false,
      };
    });
    
    setTableRows([...filtered, ...newRows]);
    handleBulkAddClose();
  };

  const handleSaveNewTax = () => {
    if (!newTax.name || !newTax.rate) {
      alert("Please fill in Tax Name and Rate");
      return;
    }
    const taxOption = {
      id: `gst${newTax.rate}`,
      name: newTax.name,
      rate: parseFloat(newTax.rate),
      display: `${newTax.name} [${newTax.rate}%]`,
    };
    setTaxOptions([...taxOptions, taxOption]);
    setNewTax({ name: "", rate: "", type: "" });
    setShowNewTaxModal(false);
  };

  // Add Item to Group Handlers
  const fetchExistingGroups = async () => {
    setLoadingGroups(true);
    try {
      const userStr = localStorage.getItem("rootfinuser");
      const user = userStr ? JSON.parse(userStr) : null;
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "1000",
        isAdmin: "true",
        all: "true",
        includeEmpty: "true",
      });
      if (user?.email) queryParams.append("userId", user.email);
      if (user?.power) queryParams.append("userPower", user.power);
      if (user?.locCode) queryParams.append("locCode", user.locCode);

      const response = await fetch(`${API_URL}/api/shoe-sales/item-groups?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const groupsList = Array.isArray(data) ? data : (data.groups || data.itemGroups || data.items || data.data || []);
        console.log("Fetched existing item groups count:", groupsList.length);
        setExistingGroups(groupsList);
        if (groupsList.length > 0) {
          setSelectedGroupId((prev) => {
            const exists = groupsList.some((g) => (g._id || g.id) === prev);
            return exists ? prev : (groupsList[0]._id || groupsList[0].id);
          });
        }
      }
    } catch (err) {
      console.error("Error fetching item groups:", err);
      setExistingGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleOpenAddToGroup = (row) => {
    const itemName = row.item || row.itemData?.itemName || "";
    setActiveGroupRow(row);
    setGroupModalItemName(itemName);
    setNewGroupName(itemName ? `${itemName} Group` : "");
    setGroupOption("existing");
    setShowAddToGroupModal(true);
    fetchExistingGroups();
  };

  const handleCreateGroupOnly = async () => {
    if (!newGroupName.trim()) {
      alert("Please enter a new item group name.");
      return;
    }

    setSavingGroup(true);
    try {
      const userStr = localStorage.getItem("rootfinuser");
      const user = userStr ? JSON.parse(userStr) : null;
      const targetWarehouse = warehouse || user?.warehouse || "Warehouse";

      const createRes = await fetch(`${API_URL}/api/shoe-sales/item-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          unit: newGroupUnit || "PCS",
          itemType: "goods",
          userWarehouse: targetWarehouse,
          items: [],
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create item group");
      }

      const createdGroup = await createRes.json();
      const createdGroupId = createdGroup._id || createdGroup.id;
      const groupName = createdGroup.name || newGroupName.trim();

      const newGroupObj = {
        _id: createdGroupId,
        id: createdGroupId,
        groupId: createdGroup.groupId || "",
        name: groupName,
        items: 0,
        unit: newGroupUnit || "PCS",
        ...createdGroup,
      };

      setExistingGroups((prev) => [
        newGroupObj,
        ...prev.filter((g) => (g._id || g.id) !== createdGroupId),
      ]);
      setSelectedGroupId(createdGroupId);
      setGroupOption("existing");
      setNewGroupName("");
      fetchExistingGroups();
    } catch (err) {
      console.error("Error creating item group:", err);
      alert(err.message || "Failed to create item group");
    } finally {
      setSavingGroup(false);
    }
  };

  const handleConfirmAddToGroup = async () => {
    if (!activeGroupRow) return;
    const finalItemName = (groupModalItemName || activeGroupRow.item || activeGroupRow.itemData?.itemName || "").trim();
    if (!finalItemName) {
      alert("Please provide an item name first.");
      return;
    }

    if (groupOption === "new") {
      if (!newGroupName.trim()) {
        alert("Please enter a new item group name.");
        return;
      }

      setSavingGroup(true);
      try {
        const userStr = localStorage.getItem("rootfinuser");
        const user = userStr ? JSON.parse(userStr) : null;
        const targetWarehouse = warehouse || user?.warehouse || "Warehouse";

        const createRes = await fetch(`${API_URL}/api/shoe-sales/item-groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newGroupName.trim(),
            unit: newGroupUnit || "PCS",
            itemType: "goods",
            userWarehouse: targetWarehouse,
            items: [],
          }),
        });

        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          throw new Error(err.message || "Failed to create item group");
        }

        const createdGroup = await createRes.json();
        const createdGroupId = createdGroup._id || createdGroup.id;
        const groupName = createdGroup.name || newGroupName.trim();

        // Immediately update existingGroups state so it shows right away in the Existing Groups list
        const newGroupObj = {
          _id: createdGroupId,
          id: createdGroupId,
          groupId: createdGroup.groupId || "",
          name: groupName,
          items: 0,
          unit: newGroupUnit || "PCS",
          ...createdGroup,
        };

        setExistingGroups((prev) => [
          newGroupObj,
          ...prev.filter((g) => (g._id || g.id) !== createdGroupId),
        ]);
        setSelectedGroupId(createdGroupId);

        setTableRows((prev) =>
          prev.map((r) => {
            if (r.id === activeGroupRow.id) {
              return {
                ...r,
                item: finalItemName,
                groupName: groupName,
                itemGroupId: createdGroupId,
                pendingGroup: {
                  option: "existing",
                  groupId: createdGroupId,
                  groupName: groupName,
                  unit: newGroupUnit || "PCS",
                },
              };
            }
            return r;
          })
        );

        fetchExistingGroups();
        setShowAddToGroupModal(false);
        setActiveGroupRow(null);
        setNewGroupName("");
      } catch (err) {
        console.error("Error creating item group:", err);
        alert(err.message || "Failed to create item group");
      } finally {
        setSavingGroup(false);
      }
    } else {
      if (!selectedGroupId) {
        alert("Please select an item group from the list.");
        return;
      }

      const selectedGroup = existingGroups.find((g) => (g._id || g.id) === selectedGroupId);
      const groupName = selectedGroup?.name || "Existing Group";

      setTableRows((prev) =>
        prev.map((r) => {
          if (r.id === activeGroupRow.id) {
            return {
              ...r,
              item: finalItemName,
              itemGroupId: selectedGroupId,
              groupName: groupName,
              pendingGroup: {
                option: "existing",
                groupId: selectedGroupId,
                groupName: groupName,
                unit: selectedGroup?.unit || "PCS",
              },
            };
          }
          return r;
        })
      );

      setShowAddToGroupModal(false);
      setActiveGroupRow(null);
    }
  };

  const handleOpenGroupItemModal = (targetRow = null) => {
    setGroupModalBatchOption("existing");
    setGroupModalBatchGroupId("");
    setGroupModalBatchNewName("");
    setGroupModalBatchUnit("PCS");
    setGroupModalBatchItemName(targetRow?.item || targetRow?.itemData?.itemName || "");
    setGroupModalBatchHsn(targetRow?.hsnCode || targetRow?.itemData?.hsnCode || "");
    setGroupModalBatchQuantity("10");
    setGroupModalBatchTax(targetRow?.tax || "");
    setGroupModalBatchCost(targetRow?.rate || "0.00");
    setGroupModalBatchSelling(targetRow?.sellingPrice || "0.00");
    setGroupModalBatchSize(targetRow?.size || "");
    setGroupModalBatchSkuPrefix("");
    setShowGroupItemModal(true);
    fetchExistingGroups();
  };

  const handleConfirmGroupItemModal = () => {
    let groupName = "";
    let groupId = null;
    const isNew = groupModalBatchOption === "new";

    if (isNew) {
      if (!groupModalBatchNewName.trim()) {
        alert("Please enter a new group name");
        return;
      }
      groupName = groupModalBatchNewName.trim();
    } else {
      if (!groupModalBatchGroupId) {
        alert("Please select an item group from the list");
        return;
      }
      const selectedGroup = existingGroups.find(
        (g) => (g._id || g.id) === groupModalBatchGroupId
      );
      groupName = selectedGroup?.name || "Group";
      groupId = groupModalBatchGroupId;
    }

    const count = parseInt(groupModalBatchQuantity, 10);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid quantity (minimum 1)");
      return;
    }

    const finalItemName = (groupModalBatchItemName.trim() || groupName);
    const allTaxOptions = [...taxOptions, ...nonTaxableOptions];
    const discountConfig = {
      value: discount.value,
      type: discount.type,
      applyAfterTax: applyDiscountAfterTax,
    };

    const costNum = parseFloat(groupModalBatchCost) || 0;
    const sellingNum = parseFloat(groupModalBatchSelling) || 0;
    const baseSku = groupModalBatchSkuPrefix.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const generatedRows = [];
    const startingTimestamp = Date.now();

    for (let i = 0; i < count; i++) {
      const rowId = startingTimestamp + i;
      const rowSku = `${baseSku}-${i + 1}`;

      const baseRow = {
        id: rowId,
        item: finalItemName,
        itemData: {
          _id: null,
          itemName: finalItemName,
          sku: rowSku,
          hsnCode: groupModalBatchHsn.trim(),
          costPrice: costNum,
          sellingPrice: sellingNum,
          mrp: sellingNum,
          itemGroupId: groupId,
          groupName: groupName,
        },
        itemDescription: "",
        sku: rowSku,
        hsnCode: groupModalBatchHsn.trim(),
        size: groupModalBatchSize.trim(),
        quantity: "1.00",
        rate: costNum.toFixed(2),
        sellingPrice: sellingNum.toFixed(2),
        mrp: sellingNum.toFixed(2),
        percentage: "",
        tax: groupModalBatchTax,
        customer: "",
        amount: (1 * costNum).toFixed(2),
        groupName: groupName,
        itemGroupId: groupId,
        pendingGroup: {
          option: isNew ? "new" : "existing",
          name: groupName,
          groupId: groupId,
          unit: groupModalBatchUnit || "PCS",
        },
      };

      const gstCalc = calculateGSTLineItem(
        baseRow,
        discountConfig,
        allTaxOptions,
        costNum
      );

      generatedRows.push({
        ...baseRow,
        ...gstCalc,
        amount: gstCalc.baseAmount,
      });
    }

    setTableRows((prev) => {
      const isEmptyInitial =
        prev.length === 1 &&
        !prev[0].item &&
        (!prev[0].sku || prev[0].sku === "") &&
        (parseFloat(prev[0].rate) === 0 || !prev[0].rate);

      if (isEmptyInitial) {
        return generatedRows;
      } else {
        return [...prev, ...generatedRows];
      }
    });

    setShowGroupItemModal(false);
  };

  // Helper function to generate high-resolution Code 128 barcode SVG
  const generateCode128Svg = (text) => {
    if (!text) return "";
    const patterns = [
      "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
      "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
      "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
      "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
      "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
      "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
      "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
      "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
      "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
      "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
      "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
    ];

    const cleanStr = String(text).replace(/[^\x20-\x7E]/g, "");
    if (!cleanStr) return "";

    let checksum = 104; // Start Code B
    const codes = [104];

    for (let i = 0; i < cleanStr.length; i++) {
      const charCode = cleanStr.charCodeAt(i) - 32;
      codes.push(charCode);
      checksum += charCode * (i + 1);
    }

    codes.push(checksum % 103);
    codes.push(106); // Stop Code

    let patternStr = "";
    for (const code of codes) {
      patternStr += patterns[code] || "";
    }

    let totalWidth = 0;
    for (let i = 0; i < patternStr.length; i++) {
      totalWidth += parseInt(patternStr[i], 10);
    }

    let rects = "";
    let currentX = 0;
    for (let i = 0; i < patternStr.length; i++) {
      const width = parseInt(patternStr[i], 10);
      const isBar = i % 2 === 0;
      if (isBar) {
        rects += `<rect x="${currentX}" y="0" width="${width}" height="35" fill="#000000" />`;
      }
      currentX += width;
    }

    return `<svg class="barcode-svg" viewBox="0 0 ${totalWidth} 35" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">${rects}</svg>`;
  };

  // Handler to print Jewelry Barcode Labels for each quantity unit
  const handlePrintRowSku = (row) => {
    const itemName = (row.item || row.itemData?.itemName || "Jewelry Item").trim();
    let sku = (row.sku || row.itemData?.sku || "").trim();

    // If row doesn't have SKU yet, auto-generate one
    if (!sku) {
      const cleanName = itemName.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const prefix = cleanName.slice(0, 4) || "ITEM";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      sku = `${prefix}-${randomNum}`;
      handleUpdateRow(row.id, "sku", sku);
    }

    const priceNum = parseFloat(row.mrp || row.sellingPrice || row.rate || 0);
    const displayPrice = isNaN(priceNum) ? "0.00" : priceNum.toFixed(2);
    
    // Store name
    const storeName = "Brynex Jewels";

    // Number of tags to print equals Quantity
    const qty = Math.max(1, Math.round(parseFloat(row.quantity) || 1));

    // Generate unique 10-digit sequential serial numbers for each quantity unit
    let baseSerialSeed = 1000001000 + Math.floor(Math.random() * 899000);
    if (/^\d{6,10}$/.test(sku)) {
      baseSerialSeed = parseInt(sku, 10);
    }

    let tagsHtml = "";
    for (let i = 0; i < qty; i++) {
      const unitSerial = (baseSerialSeed + i).toString();
      const barcodeSvg = generateCode128Svg(unitSerial);

      tagsHtml += `
        <div class="tag-page">
          <div class="tag-card">
            <!-- Left Block: Store Name, Barcode, Serial Number -->
            <div class="tag-left">
              <div class="store-name">${storeName}</div>
              <div class="barcode-container">
                ${barcodeSvg}
              </div>
              <div class="serial-text">${unitSerial}</div>
            </div>

            <!-- Right Block: Item Code, Item Name, Price -->
            <div class="tag-right">
              <div class="sku-code">${sku}</div>
              <div class="item-title">${itemName}</div>
              <div class="price-val">Rs ${displayPrice}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Create hidden print iframe
    let printFrame = document.getElementById("sku-print-frame");
    if (printFrame) {
      printFrame.remove();
    }

    printFrame = document.createElement("iframe");
    printFrame.id = "sku-print-frame";
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";
    document.body.appendChild(printFrame);

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Jewelry Tags - ${sku} (${qty} pcs)</title>
          <style>
            @page {
              size: 70mm 15mm;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              width: 100%;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            .tag-page {
              width: 70mm;
              height: 15mm;
              padding: 1.2mm 2.5mm;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              page-break-inside: avoid;
              overflow: hidden;
            }
            .tag-page:last-child {
              page-break-after: avoid;
            }
            .tag-card {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: row;
              align-items: stretch;
              justify-content: space-between;
            }
            .tag-left {
              width: 48%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              padding-right: 2mm;
            }
            .store-name {
              font-size: 6.8pt;
              font-weight: 800;
              line-height: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              letter-spacing: 0.2px;
              color: #000;
            }
            .barcode-container {
              width: 100%;
              height: 6mm;
              margin: 0.2mm 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .serial-text {
              font-size: 7pt;
              font-weight: 800;
              letter-spacing: 0.8px;
              line-height: 1;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              color: #000;
            }
            .tag-right {
              width: 50%;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: space-between;
              text-align: left;
              padding-left: 2mm;
            }
            .sku-code {
              font-size: 7.5pt;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              line-height: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              color: #000;
            }
            .item-title {
              font-size: 6.8pt;
              font-weight: 700;
              line-height: 1.15;
              color: #111;
              max-height: 2.3em;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .price-val {
              font-size: 8.5pt;
              font-weight: 900;
              line-height: 1;
              letter-spacing: 0.2px;
              color: #000;
            }
          </style>
        </head>
        <body>
          ${tagsHtml}
        </body>
      </html>
    `;

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          if (printFrame) printFrame.remove();
        }, 1200);
      }
    }, 250);
  };

  // Calculate totals
  const calculateTotals = () => {
    const allTaxOptions = [...taxOptions, ...nonTaxableOptions];
    const discountConfig = {
      value: discount.value,
      type: discount.type,
      applyAfterTax: applyDiscountAfterTax,
    };

    const totalBaseAmount = tableRows.reduce((sum, row) => {
      const qty = parseFloat(row.quantity) || 0;
      const rate = parseFloat(row.rate) || 0;
      return sum + (qty * rate);
    }, 0);

    const recalculatedRows = tableRows.map(row => {
      const gstCalculation = calculateGSTLineItem(row, discountConfig, allTaxOptions, totalBaseAmount);
      return {
        ...row,
        ...gstCalculation,
        amount: gstCalculation.baseAmount,
      };
    });

    const subTotal = parseFloat(totalBaseAmount.toFixed(2));

    // Calculate discount amount
    let discountAmount = 0;
    const rawDiscountVal = parseFloat(discount.value);
    const discountVal = isNaN(rawDiscountVal) ? 0 : Math.abs(rawDiscountVal);

    if (discountVal > 0) {
      if (discount.type === "%") {
        discountAmount = (subTotal * discountVal) / 100;
      } else {
        discountAmount = discountVal;
      }
      discountAmount = Math.min(subTotal, discountAmount);
    }
    discountAmount = parseFloat(discountAmount.toFixed(2));

    // Total Tax = sum of all lineTaxTotal values (each already rounded to 2 decimals)
    const calculatedTotalTax = recalculatedRows.reduce((sum, row) => {
      return sum + (parseFloat(row.lineTaxTotal) || 0);
    }, 0);
    
    // Round to 2 decimal places (Zoho Books behavior)
    const roundedCalculatedTotalTax = parseFloat(calculatedTotalTax.toFixed(2));

    // Use editable tax amount if set, otherwise use calculated
    const totalTax = (totalTaxAmount && parseFloat(totalTaxAmount) > 0) 
      ? parseFloat(totalTaxAmount) 
      : roundedCalculatedTotalTax;

    // Aggregate tax breakdown by CGST/SGST rate separately (for display)
    // Group CGST by rate, SGST by rate, and IGST by rate separately
    const cgstMap = new Map(); // cgstRate -> { rate, amount }
    const sgstMap = new Map(); // sgstRate -> { rate, amount }
    const igstMap = new Map(); // igstRate -> { rate, amount }
    
    recalculatedRows.forEach((row) => {
      if (row.taxPercent > 0) {
        // Aggregate CGST by rate
        if (row.cgstPercent > 0 && parseFloat(row.cgstAmount) > 0) {
          const cgstRate = row.cgstPercent;
          if (cgstMap.has(cgstRate)) {
            cgstMap.get(cgstRate).amount += parseFloat(row.cgstAmount) || 0;
          } else {
            cgstMap.set(cgstRate, {
              rate: cgstRate,
              amount: parseFloat(row.cgstAmount) || 0,
            });
          }
        }
        
        // Aggregate SGST by rate
        if (row.sgstPercent > 0 && parseFloat(row.sgstAmount) > 0) {
          const sgstRate = row.sgstPercent;
          if (sgstMap.has(sgstRate)) {
            sgstMap.get(sgstRate).amount += parseFloat(row.sgstAmount) || 0;
          } else {
            sgstMap.set(sgstRate, {
              rate: sgstRate,
              amount: parseFloat(row.sgstAmount) || 0,
            });
          }
        }
        
        // Aggregate IGST by rate
        if (row.igstPercent > 0 && parseFloat(row.igstAmount) > 0) {
          const igstRate = row.igstPercent;
          if (igstMap.has(igstRate)) {
            igstMap.get(igstRate).amount += parseFloat(row.igstAmount) || 0;
          } else {
            igstMap.set(igstRate, {
              rate: igstRate,
              amount: parseFloat(row.igstAmount) || 0,
            });
          }
        }
      }
    });

    // Convert maps to arrays and combine for display
    const taxBreakdown = [];
    
    // Get all unique rates from both CGST and SGST maps
    const allRates = new Set([
      ...Array.from(cgstMap.keys()),
      ...Array.from(sgstMap.keys()),
    ]);
    
    // Sort rates in ascending order
    const sortedRates = Array.from(allRates).sort((a, b) => a - b);
    
    // For each rate, add CGST first, then SGST (if they exist)
    sortedRates.forEach(rate => {
      if (cgstMap.has(rate)) {
        const cgstItem = cgstMap.get(rate);
        taxBreakdown.push({ 
          type: 'CGST', 
          rate: cgstItem.rate, 
          amount: parseFloat(cgstItem.amount.toFixed(2)) 
        });
      }
      if (sgstMap.has(rate)) {
        const sgstItem = sgstMap.get(rate);
        taxBreakdown.push({ 
          type: 'SGST', 
          rate: sgstItem.rate, 
          amount: parseFloat(sgstItem.amount.toFixed(2)) 
        });
      }
    });
    
    // Add IGST entries at the end, sorted by rate
    const igstEntries = Array.from(igstMap.values())
      .map(item => ({ type: 'IGST', rate: item.rate, amount: parseFloat(item.amount.toFixed(2)) }))
      .sort((a, b) => a.rate - b.rate);
    
    taxBreakdown.push(...igstEntries);

    // Calculate TDS/TCS
    let tdsTcsAmount = 0;
    if (tdsTcsTax) {
      const allTdsTcsOptions = [...taxOptions, ...tdsOptions];
      const selectedTdsTcsTax = allTdsTcsOptions.find(t => t.id === tdsTcsTax);
      if (selectedTdsTcsTax && selectedTdsTcsTax.rate !== undefined) {
        const totalBaseExTax = recalculatedRows.reduce((sum, r) => sum + (parseFloat(r.baseAmount) || 0), 0);
        let baseAmountForTds = totalBaseExTax - discountAmount;
        if (applyDiscountAfterTax) {
          baseAmountForTds = totalBaseExTax;
        }
        tdsTcsAmount = (Math.max(0, baseAmountForTds) * selectedTdsTcsTax.rate) / 100;
      }
    }

    const adjustmentAmount = parseFloat(adjustment) || 0;

    // For Inclusive GST: Subtotal already includes tax
    // Final Total = Subtotal - Discount - TDS/TCS + Adjustment
    const finalTotal = Math.max(0, subTotal - discountAmount - tdsTcsAmount + adjustmentAmount);

    return {
      subTotal: subTotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxBreakdown,
      totalTax: totalTax,
      calculatedTotalTax: roundedCalculatedTotalTax, // For display in input field
      tdsTcsAmount: tdsTcsAmount.toFixed(2),
      adjustmentAmount: adjustmentAmount.toFixed(2),
      finalTotal: finalTotal.toFixed(2)
    };
  };

  const totals = calculateTotals();

  // Save bill to MongoDB
  // Load bill data when in edit mode
  useEffect(() => {
    if (isEditMode && billId) {
      const loadBill = async () => {
        setLoadingBill(true);
        try {
          const response = await fetch(`${API_URL}/api/purchase/bills/${billId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch bill");
          }
          const billData = await response.json();
          
          // Populate form fields
          setBillNumber(billData.billNumber || "");
          setOrderNumber(billData.orderNumber || "");
          setBillDate(billData.billDate ? formatDateForInput(billData.billDate) : "");
          setDueDate(billData.dueDate ? formatDateForInput(billData.dueDate) : "");
          setBranch(billData.branch || "Warehouse");
          setWarehouse(billData.warehouse || "Warehouse");
          setDiscount(billData.discount || { value: "0", type: "%" });
          setApplyDiscountAfterTax(billData.applyDiscountAfterTax || false);
          setTotalTaxAmount(billData.totalTaxAmount?.toString() || "");
          setTdsTcsType(billData.tdsTcsType || "TDS");
          setTdsTcsTax(billData.tdsTcsTax || "");
          setAdjustment(billData.adjustment?.toString() || "0.00");
          setSourceOfSupply(billData.sourceOfSupply || "");
          setDestinationOfSupply(billData.destinationOfSupply || "");
          
          // Set vendor
          if (billData.vendorName) {
            setVendorName(billData.vendorName);
            // Try to fetch vendor details if vendorId exists
            if (billData.vendorId) {
              try {
                const vendorResponse = await fetch(`${API_URL}/api/purchase/vendors/${billData.vendorId}`);
                if (vendorResponse.ok) {
                  const vendorData = await vendorResponse.json();
                  setSelectedVendor(vendorData);
                }
              } catch (error) {
                console.error("Error fetching vendor:", error);
              }
            }
          }
          
          // Set items
          if (billData.items && Array.isArray(billData.items)) {
            const rows = billData.items.map((item, index) => ({
              id: index + 1,
              item: item.itemName || "",
              itemData: item.itemId ? { _id: item.itemId, itemName: item.itemName, sku: item.itemSku, hsnCode: item.hsnCode, sellingPrice: item.sellingPrice } : null,
              itemDescription: item.itemDescription || "",
              sku: item.itemSku || item.sku || "",
              hsnCode: item.hsnCode || "",
              size: item.size || "",
              quantity: (item.quantity || 0).toString(),
              rate: (item.rate || 0).toString(),
              sellingPrice: (item.sellingPrice !== undefined && item.sellingPrice !== null ? item.sellingPrice : (item.rate || 0)).toString(),
              mrp: (item.mrp !== undefined && item.mrp !== null ? item.mrp : (item.sellingPrice || item.rate || 0)).toString(),
              percentage: item.percentage || "",
              tax: item.taxCode || "",
              customer: "",
              amount: (item.amount || 0).toString(),
              baseAmount: (item.baseAmount || 0).toString(),
              discountedAmount: (item.discountedAmount || 0).toString(),
              cgstAmount: (item.cgstAmount || 0).toString(),
              sgstAmount: (item.sgstAmount || 0).toString(),
              igstAmount: (item.igstAmount || 0).toString(),
              lineTaxTotal: (item.lineTaxTotal || 0).toString(),
              lineTotal: (item.lineTotal || 0).toString(),
              taxCode: item.taxCode || "",
              taxPercent: item.taxPercent || 0,
              cgstPercent: item.cgstPercent || 0,
              sgstPercent: item.sgstPercent || 0,
              igstPercent: item.igstPercent || 0,
              isInterState: item.isInterState || false,
            }));
            setTableRows(rows.length > 0 ? rows : [{ id: 1, item: "", itemData: null, itemDescription: "", sku: "", hsnCode: "", size: "", quantity: "1.00", rate: "0.00", sellingPrice: "0.00", mrp: "0.00", percentage: "", tax: "", customer: "", amount: "0.00", baseAmount: "0.00", discountedAmount: "0.00", cgstAmount: "0.00", sgstAmount: "0.00", igstAmount: "0.00", lineTaxTotal: "0.00", lineTotal: "0.00", taxCode: "", taxPercent: 0, cgstPercent: 0, sgstPercent: 0, igstPercent: 0, isInterState: false }]);
          }
          
          // Set attachments
          if (billData.attachments && Array.isArray(billData.attachments)) {
            setAttachments(billData.attachments);
          }
        } catch (error) {
          console.error("Error loading bill:", error);
          alert("Failed to load bill for editing.");
          navigate("/purchase/bills");
        } finally {
          setLoadingBill(false);
        }
      };
      loadBill();
    }
  }, [isEditMode, billId, API_URL, navigate]);

  // Auto-fetch TDS from vendor when vendor is selected (only if user selected TDS, not forced)
  useEffect(() => {
    if (isEditMode) return;
    
    if (tdsTcsType === "TDS" && selectedVendor && selectedVendor.tds) {
      const vendorTds = selectedVendor.tds;
      const matchedTds = tdsOptions.find(option => {
        return option.name === vendorTds || 
               option.display === vendorTds ||
               vendorTds.includes(option.name) ||
               option.name.includes(vendorTds);
      });
      
      if (matchedTds) {
        setTdsTcsTax(matchedTds.id);
      }
    }
  }, [selectedVendor, tdsOptions, isEditMode, tdsTcsType]);

  // Helper function to format date for input field (dd/MM/yyyy)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to get current date in dd/MM/yyyy format
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert dd/MM/yyyy to YYYY-MM-DD (for date input)
  const convertToDateInputFormat = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  // Convert YYYY-MM-DD to dd/MM/yyyy (from date input)
  const convertFromDateInputFormat = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return "";
  };

  // Set current date for bill date and due date when creating a new bill
  // Also auto-generate unique bill number if not in edit mode
  useEffect(() => {
    if (!isEditMode) {
      const currentDate = getCurrentDate();
      setBillDate(currentDate);
      setDueDate(currentDate);
      
      // Auto-generate unique bill number
      if (!billNumber) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedBillNum = `BILL-${randomNum}`;
        setBillNumber(generatedBillNum);
      }
    }
  }, [isEditMode]);

  const handleSaveBill = async (status) => {
    // Validate required fields
    if (!billNumber || !billDate || !selectedVendor) {
      alert("Please fill in all required fields: Bill#, Bill Date, and Vendor Name");
      return;
    }

    setSaving(true);
    try {
      // Get user info
      const userStr = localStorage.getItem("rootfinuser");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id || user?.id || user?.email || user?.locCode || null;
      const locCode = user?.locCode || "";

      if (!userId) {
        alert("User not logged in. Please log in to save bills.");
        setSaving(false);
        return;
      }

      // Convert billDate from dd/MM/yyyy to Date object
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(dateStr);
      };

      // Convert dueDate from dd/MM/yyyy to Date object
      const dueDateObj = dueDate ? parseDate(dueDate) : null;
      const billDateObj = parseDate(billDate);

      const targetWarehouse = warehouse?.trim() || "Warehouse";

      // 1. Gather valid rows
      const validRows = tableRows.filter((r) => (r.item || r.itemData?.itemName || "").trim());

      // 2. Identify new groups to create (deduplicated by name)
      const newGroupsMap = {}; // groupName -> createdGroupId
      for (const row of validRows) {
        if (row.pendingGroup?.option === "new" && row.pendingGroup?.name) {
          const gName = row.pendingGroup.name.trim();
          if (!newGroupsMap[gName]) {
            try {
              const createRes = await fetch(`${API_URL}/api/shoe-sales/item-groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: gName,
                  unit: row.pendingGroup.unit || "PCS",
                  itemType: "goods",
                  userWarehouse: targetWarehouse,
                  items: [],
                }),
              });
              if (createRes.ok) {
                const createdGroup = await createRes.json();
                newGroupsMap[gName] = createdGroup._id || createdGroup.id;
              }
            } catch (err) {
              console.warn("Could not create group on save:", err);
            }
          }
        }
      }

      // 3. Group items by assigned group ID vs standalone
      const groupItemsMap = {}; // groupId -> Array<itemEntry>
      const standaloneRows = [];

      for (const row of validRows) {
        const finalItemName = (row.item || row.itemData?.itemName || "").trim();
        const rowQuantity = parseFloat(row.quantity) || 0;
        const rowCost = parseFloat(row.rate) || 0;
        const rowSelling = parseFloat(row.sellingPrice) || 0;
        const rowSku = (row.sku || row.itemData?.sku || "").trim();
        const rowHsn = (row.hsnCode || row.itemData?.hsnCode || "").trim();
        const rowSize = (row.size || "").trim();

        let assignedGroupId = row.itemGroupId || row.itemData?.itemGroupId || row.itemData?.groupId || null;
        if (row.pendingGroup?.option === "new" && row.pendingGroup?.name && newGroupsMap[row.pendingGroup.name.trim()]) {
          assignedGroupId = newGroupsMap[row.pendingGroup.name.trim()];
        } else if (row.pendingGroup?.option === "existing" && row.pendingGroup?.groupId) {
          assignedGroupId = row.pendingGroup.groupId;
        }

        const itemData = {
          row,
          finalItemName,
          rowQuantity,
          rowCost,
          rowSelling,
          rowSku,
          rowHsn,
          rowSize,
          assignedGroupId,
        };

        if (assignedGroupId) {
          if (!groupItemsMap[assignedGroupId]) {
            groupItemsMap[assignedGroupId] = [];
          }
          groupItemsMap[assignedGroupId].push(itemData);
        } else {
          standaloneRows.push(itemData);
        }
      }

      // 4. Batch update each item group ONCE with ALL its line items
      const processedItems = [];

      for (const [groupId, itemsToAdd] of Object.entries(groupItemsMap)) {
        try {
          const groupFetchRes = await fetch(`${API_URL}/api/shoe-sales/item-groups/${groupId}`);
          let existingGroup = null;
          if (groupFetchRes.ok) {
            existingGroup = await groupFetchRes.json();
          }

          let currentGroupItems = Array.isArray(existingGroup?.items) ? [...existingGroup.items] : [];

          for (const itemEntry of itemsToAdd) {
            const { finalItemName, rowQuantity, rowCost, rowSelling, rowSku, rowHsn, rowSize } = itemEntry;

            // Check if item already exists in this group by SKU or name + size
            let existingItemIdx = currentGroupItems.findIndex((gi) =>
              (rowSku && gi.sku && gi.sku.trim().toUpperCase() === rowSku.toUpperCase()) ||
              (gi.name && gi.name.trim().toLowerCase() === finalItemName.toLowerCase() && (gi.size || "") === rowSize)
            );

            if (existingItemIdx !== -1) {
              // Update metadata on existing group item (prices/HSN) without pre-incrementing stock
              const targetItem = { ...currentGroupItems[existingItemIdx] };
              targetItem.sellingPrice = rowSelling || targetItem.sellingPrice || 0;
              targetItem.costPrice = rowCost || targetItem.costPrice || 0;
              if (rowHsn) targetItem.hsnCode = rowHsn;
              currentGroupItems[existingItemIdx] = targetItem;
            } else {
              // Append new item to group with initial 0 stock; BillController adds bill quantity
              const newItem = {
                name: finalItemName,
                itemName: finalItemName,
                sku: rowSku || `${existingGroup?.sku || "SKU"}-${currentGroupItems.length + 1}`,
                hsnCode: rowHsn,
                size: rowSize,
                costPrice: rowCost,
                sellingPrice: rowSelling,
                stock: 0,
                isActive: true,
                warehouseStocks: [{
                  warehouse: targetWarehouse,
                  openingStock: 0,
                  openingStockValue: 0,
                  stockOnHand: 0,
                  committedStock: 0,
                  availableForSale: 0,
                  physicalOpeningStock: 0,
                  physicalStockOnHand: 0,
                  physicalCommittedStock: 0,
                  physicalAvailableForSale: 0,
                }],
              };
              currentGroupItems.push(newItem);
            }
          }

          // Save the full updated item group once
          const updateRes = await fetch(`${API_URL}/api/shoe-sales/item-groups/${groupId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...existingGroup,
              items: currentGroupItems,
            }),
          });

          let savedGroup = null;
          if (updateRes.ok) {
            savedGroup = await updateRes.json();
          }

          // Generate bill line items
          for (const itemEntry of itemsToAdd) {
            const { row, finalItemName, rowQuantity, rowCost, rowSelling, rowSku, rowHsn, rowSize } = itemEntry;
            const matchedItem = (savedGroup?.items || currentGroupItems).find((gi) =>
              (rowSku && gi.sku && gi.sku.trim().toUpperCase() === rowSku.toUpperCase()) ||
              (gi.name && gi.name.trim().toLowerCase() === finalItemName.toLowerCase())
            );

            processedItems.push({
              itemId: matchedItem?._id || matchedItem?.id || null,
              itemGroupId: groupId,
              itemName: finalItemName,
              itemDescription: row.itemDescription || "",
              size: rowSize,
              hsnCode: rowHsn,
              quantity: rowQuantity,
              rate: rowCost,
              sellingPrice: rowSelling,
              mrp: parseFloat(row.mrp) || rowSelling || 0,
              percentage: row.percentage || "",
              tax: row.tax || "",
              amount: parseFloat(row.amount) || (rowQuantity * rowCost) || 0,
              baseAmount: parseFloat(row.baseAmount) || 0,
              discountedAmount: parseFloat(row.discountedAmount) || 0,
              cgstAmount: parseFloat(row.cgstAmount) || 0,
              sgstAmount: parseFloat(row.sgstAmount) || 0,
              igstAmount: parseFloat(row.igstAmount) || 0,
              lineTaxTotal: parseFloat(row.lineTaxTotal) || 0,
              lineTotal: parseFloat(row.lineTotal) || 0,
              taxCode: row.taxCode || "",
              taxPercent: row.taxPercent || 0,
              cgstPercent: row.cgstPercent || 0,
              sgstPercent: row.sgstPercent || 0,
              igstPercent: row.igstPercent || 0,
              isInterState: row.isInterState || false,
              itemSku: rowSku,
            });
          }
        } catch (err) {
          console.error("Error processing group items in bill save:", err);
        }
      }

      // 5. Process standalone items
      for (const itemEntry of standaloneRows) {
        const { row, finalItemName, rowQuantity, rowCost, rowSelling, rowSku, rowHsn, rowSize } = itemEntry;
        let itemId = row.itemData?._id || row.itemId || null;

        try {
          const createItemRes = await fetch(`${API_URL}/api/shoe-sales/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemName: finalItemName,
              sku: rowSku,
              hsnCode: rowHsn,
              size: rowSize,
              costPrice: rowCost,
              sellingPrice: rowSelling,
              unit: "PCS",
              taxRateIntra: row.tax || "",
              trackInventory: true,
              warehouseStocks: [{
                warehouse: targetWarehouse,
                openingStock: 0,
                openingStockValue: 0,
                stockOnHand: 0,
                committedStock: 0,
                availableForSale: 0,
                physicalOpeningStock: 0,
                physicalStockOnHand: 0,
                physicalCommittedStock: 0,
                physicalAvailableForSale: 0,
              }],
            }),
          });
          if (createItemRes.ok) {
            const standaloneItem = await createItemRes.json();
            if (!itemId) itemId = standaloneItem._id || standaloneItem.id;
          }
        } catch (err) {
          console.warn("Could not sync standalone item on bill save:", err);
        }

        processedItems.push({
          itemId: itemId,
          itemGroupId: null,
          itemName: finalItemName,
          itemDescription: row.itemDescription || "",
          size: rowSize,
          hsnCode: rowHsn,
          quantity: rowQuantity,
          rate: rowCost,
          sellingPrice: rowSelling,
          mrp: parseFloat(row.mrp) || rowSelling || 0,
          percentage: row.percentage || "",
          tax: row.tax || "",
          amount: parseFloat(row.amount) || (rowQuantity * rowCost) || 0,
          baseAmount: parseFloat(row.baseAmount) || 0,
          discountedAmount: parseFloat(row.discountedAmount) || 0,
          cgstAmount: parseFloat(row.cgstAmount) || 0,
          sgstAmount: parseFloat(row.sgstAmount) || 0,
          igstAmount: parseFloat(row.igstAmount) || 0,
          lineTaxTotal: parseFloat(row.lineTaxTotal) || 0,
          lineTotal: parseFloat(row.lineTotal) || 0,
          taxCode: row.taxCode || "",
          taxPercent: row.taxPercent || 0,
          cgstPercent: row.cgstPercent || 0,
          sgstPercent: row.sgstPercent || 0,
          igstPercent: row.igstPercent || 0,
          isInterState: row.isInterState || false,
          itemSku: rowSku,
        });
      }

      const items = processedItems.filter(Boolean);

      // Prepare bill data
      const billData = {
        vendorId: selectedVendor._id || selectedVendor.id || null,
        vendorName: vendorName,
        branch: branch,
        billNumber: billNumber,
        orderNumber: orderNumber || "",
        billDate: billDateObj,
        dueDate: dueDateObj,
        sourceOfSupply: sourceOfSupply,
        destinationOfSupply: destinationOfSupply,
        warehouse: warehouse || "",
        items: items,
        discount: {
          value: discount.value,
          type: discount.type,
        },
        applyDiscountAfterTax: applyDiscountAfterTax,
        totalTaxAmount: parseFloat(totalTaxAmount) || parseFloat(totals.totalTax) || 0,
        tdsTcsType: tdsTcsType,
        tdsTcsTax: tdsTcsTax || "",
        tdsTcsAmount: parseFloat(totals.tdsTcsAmount) || 0,
        adjustment: parseFloat(adjustment) || 0,
        subTotal: parseFloat(totals.subTotal) || 0,
        discountAmount: parseFloat(totals.discountAmount) || 0,
        totalTax: parseFloat(totals.totalTax) || 0,
        finalTotal: parseFloat(totals.finalTotal) || 0,
        attachments: attachments.map(att => {
          // Extract base64 data - handle both data URL format and plain base64
          let base64Data = att.base64 || att;
          if (typeof base64Data === "string" && base64Data.startsWith("data:")) {
            // Extract the base64 part from data URL (after the comma)
            base64Data = base64Data.split(",")[1] || base64Data;
          }
          return {
            filename: att.name || "attachment",
            contentType: att.type || "application/octet-stream",
            data: base64Data,
          };
        }),
        userId: userId,
        locCode: locCode,
        status: status, // "draft" or "completed"
      };

      // Save to MongoDB
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `${API_URL}/api/purchase/bills/${billId}` : `${API_URL}/api/purchase/bills`;
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        let errorMessage = isEditMode ? "Failed to update bill" : "Failed to save bill";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const savedBill = await response.json();
      alert(`Bill ${isEditMode ? "updated" : "saved"} successfully as ${status === "draft" ? "Draft" : "Completed"}`);
      navigate(`/purchase/bills/${savedBill._id || savedBill.id}`);
    } catch (error) {
      console.error("Error saving bill:", error);
      alert(error.message || "Failed to save bill. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Enter key to save bill - DISABLED to prevent auto-saving and allow Enter for barcode printing
  // useEnterToSave(() => handleSaveBill("completed"), saving);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: uploadEvent.target.result,
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: uploadEvent.target.result,
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className={`transition-all duration-300 min-h-screen bg-[#f8f9fa] p-8 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
      {/* Page Title & Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Bill" : "New Bill"}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Create and manage purchase bills</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/sales/invoices")}
            className="px-3.5 py-1.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-none text-xs font-medium transition-colors bg-white shadow-sm cursor-pointer"
          >
            Back to Invoice
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 rounded-none transition-colors shadow-sm cursor-pointer"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="space-y-6">
        {/* Vendor & Bill Information Card */}
        <div className="bg-white rounded-none p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="text-purple-600 font-bold text-[11px] tracking-wider uppercase">
            VENDOR & BILL INFORMATION
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Vendor Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <VendorDropdown
                value={selectedVendor}
                onChange={(vendor) => {
                  setSelectedVendor(vendor);
                  setVendorName(vendor ? (vendor.displayName || vendor.companyName || "") : "");
                  if (vendor) {
                    const rawSource =
                      vendor.sourceOfSupply ||
                      vendor.placeOfSupply ||
                      vendor.state ||
                      vendor.billingAddress?.state ||
                      vendor.shippingAddress?.state ||
                      vendor.address?.state ||
                      "";
                    if (rawSource) {
                      setSourceOfSupply(normalizeSupplyState(rawSource));
                    }
                  }
                }}
                onNewVendor={() => navigate("/purchase/vendors/new")}
              />
            </div>

            {/* Bill Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  placeholder="dd-MM-yyyy"
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 pr-9"
                />
                <input
                  ref={billDateInputRef}
                  type="date"
                  value={convertToDateInputFormat(billDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setBillDate(convertFromDateInputFormat(e.target.value));
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-purple-600"
                  onClick={() => {
                    if (billDateInputRef.current) {
                      if (billDateInputRef.current.showPicker) {
                        billDateInputRef.current.showPicker();
                      } else {
                        billDateInputRef.current.click();
                      }
                    }
                  }}
                >
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            {/* Bill Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Bill Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="BILL-0001"
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 pr-9"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomNum = Math.floor(1000 + Math.random() * 9000);
                    setBillNumber(`BILL-${randomNum}`);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                  title="Auto-generate Bill Number"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>

            {/* Warehouse / Branch */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={warehouse}
                  onChange={(e) => {
                    setWarehouse(e.target.value);
                    setBranch(e.target.value);
                  }}
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 appearance-none cursor-pointer pr-9"
                >
                  <option value="Warehouse">Warehouse</option>
                  <option value="Store 1">Store 1</option>
                  <option value="Store 2">Store 2</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Order Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="INV-009193"
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 pr-9"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomNum = Math.floor(100000 + Math.random() * 900000);
                    setOrderNumber(`INV-${randomNum}`);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                  title="Auto-generate Order Number"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="dd-MM-yyyy"
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 pr-9"
                />
                <input
                  ref={dueDateInputRef}
                  type="date"
                  value={convertToDateInputFormat(dueDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setDueDate(convertFromDateInputFormat(e.target.value));
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-purple-600"
                  onClick={() => {
                    if (dueDateInputRef.current) {
                      if (dueDateInputRef.current.showPicker) {
                        dueDateInputRef.current.showPicker();
                      } else {
                        dueDateInputRef.current.click();
                      }
                    }
                  }}
                >
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            {/* Source of Supply */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Source of Supply
              </label>
              <div className="relative">
                <select
                  value={sourceOfSupply}
                  onChange={(e) => setSourceOfSupply(e.target.value)}
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 appearance-none cursor-pointer pr-9"
                >
                  <option value="">Select source of supply</option>
                  {SUPPLY_STATE_OPTIONS.map((state) => (
                    <option key={state.code} value={state.value}>
                      {state.value}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Destination of Supply */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Destination of Supply
              </label>
              <div className="relative">
                <select
                  value={destinationOfSupply || "[KL] - Kerala"}
                  onChange={(e) => setDestinationOfSupply(e.target.value)}
                  className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 appearance-none cursor-pointer pr-9"
                >
                  {SUPPLY_STATE_OPTIONS.map((state) => (
                    <option key={state.code} value={state.value}>
                      {state.value}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Item Details Table */}
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#181920] text-white text-[11px] font-semibold tracking-wider">
                  <th className="w-10 px-3 py-3 text-center">
                    <input type="checkbox" className="rounded-none border-gray-600 bg-transparent text-purple-600 focus:ring-purple-500" />
                  </th>
                  <th className="px-3 py-3 font-bold uppercase min-w-[200px]">ITEM NAME</th>
                  <th className="px-3 py-3 font-bold uppercase w-28">ITEM CODE</th>
                  <th className="px-3 py-3 font-bold uppercase w-28">HSN CODE</th>
                  <th className="px-3 py-3 font-bold uppercase w-28 text-center">QUANTITY</th>
                  <th className="px-3 py-3 font-bold uppercase w-36">TAX</th>
                  <th className="px-3 py-3 font-bold uppercase w-28">COST PRICE</th>
                  <th className="px-3 py-3 font-bold uppercase w-24 text-center">PERCENTAGE</th>
                  <th className="px-3 py-3 font-bold uppercase w-28">SELLING PRICE</th>
                  <th className="px-3 py-3 font-bold uppercase w-28">MRP</th>
                  <th className="px-3 py-3 font-bold uppercase w-28 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tableRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Checkbox */}
                    <td className="px-3 py-3 text-center align-middle">
                      <input type="checkbox" className="rounded-none border-gray-300 text-purple-600 focus:ring-purple-500" />
                    </td>

                    {/* Item Name */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-none bg-gray-200/90 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <ItemDropdown
                            rowId={row.id}
                            value={row.itemData || row.item}
                            description={row.itemDescription || ""}
                            onDescriptionChange={(desc) => handleUpdateRow(row.id, "itemDescription", desc)}
                            onChange={(value) => handleUpdateRow(row.id, "item", value)}
                            onNewItem={() => navigate("/shoe-sales/items/new")}
                            onOpenGroupModal={() => handleOpenGroupItemModal(row)}
                            warehouse={warehouse}
                          />
                          {(row.pendingGroup || row.groupName || row.itemData?.groupName) && (
                            <div className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 mt-1 flex items-center justify-between gap-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Layers size={10} />
                                <span>
                                  {row.pendingGroup?.option === "new"
                                    ? `New Group: ${row.pendingGroup?.name}`
                                    : `Group: ${row.groupName || row.pendingGroup?.groupName || row.itemData?.groupName}`}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateRow(row.id, "pendingGroup", null);
                                  handleUpdateRow(row.id, "groupName", "");
                                  handleUpdateRow(row.id, "itemGroupId", null);
                                }}
                                className="text-gray-400 hover:text-red-500 font-bold ml-1 cursor-pointer leading-none"
                                title="Remove group link"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Item Code */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        placeholder="Item Code"
                        value={row.itemData?.sku || row.sku || ""}
                        onChange={(e) => handleUpdateRow(row.id, "sku", e.target.value)}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* HSN Code */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        placeholder="HSN Code"
                        value={row.itemData?.hsnCode || row.hsnCode || ""}
                        onChange={(e) => handleUpdateRow(row.id, "hsnCode", e.target.value)}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* Quantity with Stepper */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center justify-center border border-gray-200 rounded-none h-8 bg-white px-1">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(row.quantity) || 0;
                            if (current > 1) {
                              handleUpdateRow(row.id, "quantity", (current - 1).toString());
                            }
                          }}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 text-xs font-semibold cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="text"
                          value={row.quantity}
                          onChange={(e) => handleUpdateRow(row.id, "quantity", e.target.value)}
                          className="w-8 text-center text-xs font-medium text-gray-900 border-none outline-none focus:ring-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(row.quantity) || 0;
                            handleUpdateRow(row.id, "quantity", (current + 1).toString());
                          }}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 text-xs font-semibold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Tax */}
                    <td className="px-3 py-3 align-middle min-w-[140px]">
                      <div className="relative w-full">
                        <select
                          value={row.tax || ""}
                          onChange={(e) => handleUpdateRow(row.id, "tax", e.target.value)}
                          className={`w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 py-1 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 appearance-none cursor-pointer pr-7 ${
                            row.tax ? "text-gray-900 font-medium" : "text-gray-400"
                          }`}
                        >
                          <option value="" className="text-gray-400">Select Tax</option>
                          <optgroup label="TAX GROUP">
                            {taxOptions.map((tax) => (
                              <option key={tax.id} value={tax.id} className="text-gray-900">
                                {tax.display || tax.name}
                              </option>
                            ))}
                          </optgroup>
                          {nonTaxableOptions && nonTaxableOptions.length > 0 && (
                            <optgroup label="NON-TAXABLE">
                              {nonTaxableOptions.map((opt) => (
                                <option key={opt.id} value={opt.id} className="text-gray-900">
                                  {opt.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </td>

                    {/* Cost Price */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={row.rate}
                        onChange={(e) => handleUpdateRow(row.id, "rate", e.target.value)}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* Percentage */}
                    <td className="px-3 py-3 align-middle w-24">
                      <input
                        type="text"
                        placeholder="%"
                        value={row.percentage !== undefined && row.percentage !== null ? row.percentage : ""}
                        onChange={(e) => handleUpdateRow(row.id, "percentage", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrintRowSku(row);
                          }
                        }}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 text-center focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* Selling Price */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={row.sellingPrice !== undefined ? row.sellingPrice : ""}
                        onChange={(e) => handleUpdateRow(row.id, "sellingPrice", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrintRowSku(row);
                          }
                        }}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* MRP */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={row.mrp !== undefined && row.mrp !== null ? row.mrp : ""}
                        onChange={(e) => handleUpdateRow(row.id, "mrp", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrintRowSku(row);
                            const isLastRow = tableRows[tableRows.length - 1]?.id === row.id;
                            if (isLastRow) {
                              handleAddNewRow();
                            }
                          }
                        }}
                        className="w-full h-8 rounded-none border border-gray-200 bg-white px-2.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddToGroup(row)}
                          className="w-7 h-7 rounded-none bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors shadow-2xs"
                          title="Add to Item Group"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintRowSku(row)}
                          className="w-7 h-7 rounded-none bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          title="Print SKU & Barcode Label"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="w-7 h-7 rounded-none bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shadow-2xs"
                          title="Delete Row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Action Buttons */}
          <div className="p-3.5 bg-white flex items-center gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleAddNewRow}
              className="h-8 px-3.5 inline-flex items-center justify-center rounded-none bg-[#f4f4f5] hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Add Row
            </button>
            <button
              type="button"
              onClick={() => handleOpenGroupItemModal()}
              className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-none bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
            >
              <Layers size={13} className="text-purple-600" />
              <span>Group Item</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowBulkAddModal(true);
                fetchBulkItems();
              }}
              className="h-8 px-3.5 inline-flex items-center justify-center rounded-none bg-[#f4f4f5] hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Add Bulk Items
            </button>
          </div>
        </div>

        {/* Bottom 2-Column Section: Attachments & Bill Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Attach File(s) to Bill */}
          <div className="lg:col-span-7 space-y-2.5">
            <label className="block text-xs font-semibold text-gray-700">
              Attach File (s) to Bill
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-200 rounded-none bg-white p-8 flex flex-col items-center justify-center text-center min-h-[280px]"
            >
              <UploadCloud size={44} className="text-gray-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Drag image (s) here or browse images
              </p>
              <p className="text-[11px] text-gray-400 mb-4 max-w-sm leading-relaxed">
                You can add up to 15 images, each not exceeding 5MB in size and 7000x7000 pixels resolution.
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-none text-xs transition-colors shadow-sm">
                  Upload File
                </span>
              </label>

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-4 justify-center">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group rounded-none border border-gray-200 p-1 bg-white shadow-2xs">
                      {att.base64 ? (
                        <img src={att.base64} alt="attachment" className="w-12 h-12 object-cover rounded-none" />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-none text-[10px] text-gray-600 truncate px-1">
                          {att.name || "File"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-none flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Bill Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-none p-6 border border-gray-100/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
              <div className="text-[#9333ea] font-bold text-[11px] tracking-wider uppercase mb-1">
                BILL SUMMARY
              </div>

              {/* Sub Total */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <span className="font-semibold text-gray-800">Sub Total</span>
                <span className="font-semibold text-gray-900">₹ {totals.subTotal}</span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <span className="font-medium text-gray-700">Discount</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={discount.value}
                      onChange={(e) => setDiscount({ ...discount, value: e.target.value })}
                      placeholder="0"
                      className="w-[78px] h-9 rounded-none border border-gray-200 bg-white px-3 text-xs text-right text-gray-700 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none"
                    />
                    <div className="relative">
                      <select
                        value={discount.type}
                        onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                        className="w-[68px] h-9 rounded-none border border-gray-200 bg-white pl-3 pr-6 text-xs text-gray-500 focus:border-purple-600 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="%">%</option>
                        <option value="₹">₹</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{totals.discountAmount}</span>
                </div>
              </div>

              {/* Total Tax Amount */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <div className="flex flex-col text-xs font-medium text-gray-700 leading-tight">
                  <span>Total</span>
                  <span>Tax Amount</span>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[270px] ml-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={totalTaxAmount || (totals.calculatedTotalTax > 0 ? totals.calculatedTotalTax : "")}
                      onChange={(e) => setTotalTaxAmount(e.target.value)}
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 text-xs text-right text-gray-600 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-normal pointer-events-none">INR</span>
                  </div>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-none bg-[#faf5ff] border border-purple-100 flex items-center justify-center text-[#a855f7] hover:bg-[#f3e8ff] transition-colors shrink-0"
                    title="Edit tax amount"
                  >
                    <Pencil size={14} className="text-[#a855f7]" />
                  </button>
                </div>
              </div>

              {/* TDS / TCS Radios */}
              <div className="flex items-center gap-6 py-0.5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="tdsTcsType"
                    value="TDS"
                    checked={tdsTcsType === "TDS"}
                    onChange={(e) => {
                      setTdsTcsType(e.target.value);
                      setTdsTcsTax("");
                    }}
                    className="w-3.5 h-3.5 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>TDS</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="tdsTcsType"
                    value="TCS"
                    checked={tdsTcsType === "TCS"}
                    onChange={(e) => {
                      setTdsTcsType(e.target.value);
                      setTdsTcsTax("");
                    }}
                    className="w-3.5 h-3.5 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>TCS</span>
                </label>
              </div>

              {/* Select a Tax */}
              <div className="relative py-0.5">
                <select
                  value={tdsTcsTax}
                  onChange={(e) => {
                    setTdsTcsTax(e.target.value);
                    if (!tdsTcsType && e.target.value) {
                      setTdsTcsType("TDS");
                    }
                  }}
                  className={`w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 appearance-none cursor-pointer pr-9 ${
                    tdsTcsTax ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}
                >
                  <option value="" className="text-gray-400">
                    Select a Tax
                  </option>
                  {(tdsTcsType === "TCS" ? taxOptions : tdsOptions).map((tax) => (
                    <option key={tax.id} value={tax.id} className="text-gray-900">
                      {tax.display || tax.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                />
              </div>

              {/* Adjustment */}
              <div className="flex items-center justify-between text-sm py-0.5">
                <span className="font-medium text-gray-700 text-xs">Adjustment</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="0.00"
                    className="w-[145px] h-9 rounded-none border border-gray-200 bg-white px-3 text-xs text-right text-gray-700 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">{totals.adjustmentAmount}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Total */}
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-gray-800 text-sm">Total</span>
                <span className="font-bold text-lg text-gray-900">₹ {totals.finalTotal}</span>
              </div>

              {/* Save Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveBill("draft")}
                  disabled={saving}
                  className="h-10 px-4 bg-[#f4f4f5] hover:bg-gray-200 text-gray-800 font-medium rounded-none text-xs flex items-center justify-center transition-colors text-center disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBill("completed")}
                  disabled={saving}
                  className="h-10 px-4 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-medium rounded-none text-xs flex items-center justify-center transition-colors shadow-sm text-center disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save & Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Tax Modal */}
      {showNewTaxModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-none border border-[#e1e5f5] bg-white shadow-[0_25px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-[#e7ebf8] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1f2937]">New Tax</h2>
              <button
                onClick={() => {
                  setShowNewTaxModal(false);
                  setNewTax({ name: "", rate: "", type: "" });
                }}
                className="rounded-none p-1.5 text-[#9ca3af] hover:bg-[#f1f5f9] hover:text-[#475569] transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <Label required>Tax Name</Label>
                <Input
                  placeholder=""
                  value={newTax.name}
                  onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                />
              </div>
              <div>
                <Label required>Rate (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder=""
                    value={newTax.rate}
                    onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                    className="flex-1"
                  />
                  <div className="rounded-none border border-[#d7dcf5] bg-white px-3 py-2.5 text-sm text-[#64748b]">
                    %
                  </div>
                </div>
              </div>
              <div>
                <Label>Tax Type</Label>
                <Select
                  value={newTax.type}
                  onChange={(e) => setNewTax({ ...newTax, type: e.target.value })}
                >
                  <option value="">Select a Tax Type</option>
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                  <option value="Sales Tax">Sales Tax</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#e7ebf8] px-6 py-4 bg-[#fafbff]">
              <button
                onClick={() => {
                  setShowNewTaxModal(false);
                  setNewTax({ name: "", rate: "", type: "" });
                }}
                className="rounded-none border border-[#d7dcf5] bg-white px-5 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTax}
                className="rounded-none border border-[#d7dcf5] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item to Group Modal */}
      {showAddToGroupModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-none border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#181920] text-white">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                <h3 className="text-sm font-semibold tracking-wide">Add Item to Group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddToGroupModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Product Details Preview */}
              <div className="bg-gray-50 border border-gray-200 p-3 space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Item / Product Name
                  </label>
                  <input
                    type="text"
                    value={groupModalItemName}
                    onChange={(e) => setGroupModalItemName(e.target.value)}
                    placeholder="Enter item name"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-gray-200 text-gray-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-200">
                  <div><span className="font-semibold text-gray-500">SKU:</span> {activeGroupRow?.sku || activeGroupRow?.itemData?.sku || "—"}</div>
                  <div><span className="font-semibold text-gray-500">HSN:</span> {activeGroupRow?.hsnCode || activeGroupRow?.itemData?.hsnCode || "—"}</div>
                  <div><span className="font-semibold text-gray-500">Size:</span> {activeGroupRow?.size || "—"}</div>
                </div>
              </div>

              {/* Option Selector: Existing Group vs New Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Choose Item Group Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupOption("existing")}
                    className={`h-9 px-3 text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      groupOption === "existing"
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Layers size={13} />
                    <span>Existing Group</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupOption("new")}
                    className={`h-9 px-3 text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      groupOption === "new"
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Plus size={13} />
                    <span>Create New Group</span>
                  </button>
                </div>
              </div>

              {/* Existing Group Selection */}
              {groupOption === "existing" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700">
                      Select Existing Group <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={fetchExistingGroups}
                      disabled={loadingGroups}
                      className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                      title="Refresh groups list"
                    >
                      <RotateCw size={11} className={loadingGroups ? "animate-spin" : ""} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  {loadingGroups ? (
                    <div className="text-xs text-gray-500 py-2.5 px-3 bg-gray-50 border border-gray-200 flex items-center gap-2">
                      <RotateCw size={12} className="animate-spin text-purple-600" />
                      <span>Loading item groups...</span>
                    </div>
                  ) : existingGroups.length === 0 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2.5 border border-amber-200 flex flex-col gap-1.5">
                      <span>No existing item groups found.</span>
                      <button
                        type="button"
                        onClick={() => setGroupOption("new")}
                        className="text-left font-semibold text-purple-700 hover:underline cursor-pointer"
                      >
                        + Click here to create a new group
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none appearance-none cursor-pointer pr-8"
                      >
                        <option value="">-- Choose an Item Group ({existingGroups.length} available) --</option>
                        {existingGroups.map((group) => {
                          const gId = group._id || group.id;
                          const count = typeof group.items === "number" 
                            ? group.items 
                            : (Array.isArray(group.items) ? group.items.length : (Array.isArray(group.itemsList) ? group.itemsList.length : 0));
                          const skuText = group.sku ? ` [${group.sku}]` : "";
                          const countText = count > 0 ? ` (${count} items)` : " (0 items)";
                          return (
                            <option key={gId} value={gId}>
                              {group.name}{skuText}{countText}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              )}

              {/* Create New Group Inputs */}
              {groupOption === "new" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      New Item Group Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Formal Shoes Group"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={newGroupUnit}
                      onChange={(e) => setNewGroupUnit(e.target.value)}
                      placeholder="PCS, PAIRS, etc."
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCreateGroupOnly}
                      disabled={savingGroup || !newGroupName.trim()}
                      className="w-full h-8 px-3 text-xs font-medium border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{savingGroup ? "Creating..." : "Save Group & Switch to Existing"}</span>
                    </button>
                    <p className="text-[10px] text-gray-500 mt-1 text-center">
                      Saves this group to the database and selects it in Existing Groups.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddToGroupModal(false)}
                className="h-8 px-4 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToGroup}
                disabled={savingGroup}
                className="h-8 px-4 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {savingGroup ? "Adding..." : "Add to Group"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Group Item (Batch Add) Modal */}
      {showGroupItemModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl rounded-none bg-white shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Layers size={18} />
                <h2 className="text-base font-semibold">Group Item - Bulk Row Generator</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupItemModal(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-none transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Group Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Item Group Choice</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGroupModalBatchOption("existing")}
                    className={`h-9 px-4 text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      groupModalBatchOption === "existing"
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Select Existing Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupModalBatchOption("new")}
                    className={`h-9 px-4 text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      groupModalBatchOption === "new"
                        ? "bg-purple-50 border-purple-600 text-purple-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Plus size={14} />
                    Create New Group
                  </button>
                </div>
              </div>

              {/* Existing Group Selector */}
              {groupModalBatchOption === "existing" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700">
                      Select Existing Group <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={fetchExistingGroups}
                      className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <RotateCw size={11} className={loadingGroups ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                  {loadingGroups ? (
                    <div className="h-9 px-3 border border-gray-200 bg-gray-50 flex items-center text-xs text-gray-500">
                      Loading item groups...
                    </div>
                  ) : existingGroups.length === 0 ? (
                    <div className="p-3 border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-center justify-between">
                      <span>No item groups found.</span>
                      <button
                        type="button"
                        onClick={() => setGroupModalBatchOption("new")}
                        className="text-purple-700 font-semibold underline hover:text-purple-900"
                      >
                        Create New
                      </button>
                    </div>
                  ) : (
                    <select
                      value={groupModalBatchGroupId}
                      onChange={(e) => {
                        const gid = e.target.value;
                        setGroupModalBatchGroupId(gid);
                        const selectedG = existingGroups.find((g) => (g._id || g.id) === gid);
                        if (selectedG && !groupModalBatchItemName) {
                          setGroupModalBatchItemName(selectedG.name || "");
                        }
                      }}
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="">-- Choose an Item Group --</option>
                      {existingGroups.map((g) => {
                        const gId = g._id || g.id;
                        const count = Array.isArray(g.items) ? g.items.length : (typeof g.items === "number" ? g.items : 0);
                        return (
                          <option key={gId} value={gId}>
                            {g.name} ({count} items, {g.unit || "PCS"})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}

              {/* New Group Fields */}
              {groupModalBatchOption === "new" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      New Group Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={groupModalBatchNewName}
                      onChange={(e) => {
                        setGroupModalBatchNewName(e.target.value);
                        if (!groupModalBatchItemName) {
                          setGroupModalBatchItemName(e.target.value);
                        }
                      }}
                      placeholder="e.g. Ring Collection 2026"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Group Unit</label>
                    <input
                      type="text"
                      value={groupModalBatchUnit}
                      onChange={(e) => setGroupModalBatchUnit(e.target.value)}
                      placeholder="PCS, BOX, PRS"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Item Details Section */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={groupModalBatchItemName}
                      onChange={(e) => setGroupModalBatchItemName(e.target.value)}
                      placeholder="e.g. Diamond Ring Gold"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={groupModalBatchHsn}
                      onChange={(e) => setGroupModalBatchHsn(e.target.value)}
                      placeholder="e.g. 711319"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Quantity (Number of Items) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={groupModalBatchQuantity}
                      onChange={(e) => setGroupModalBatchQuantity(e.target.value)}
                      placeholder="10"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 font-semibold text-purple-700"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Generates this number of individual rows (each Qty 1.00)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Tax Rate
                    </label>
                    <select
                      value={groupModalBatchTax}
                      onChange={(e) => setGroupModalBatchTax(e.target.value)}
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="">Select Tax</option>
                      <optgroup label="Tax Rates">
                        {taxOptions.map((tax) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.display || `${tax.name} [${tax.rate}%]`}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Non-Taxable">
                        {nonTaxableOptions.map((tax) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Size (Optional)</label>
                    <input
                      type="text"
                      value={groupModalBatchSize}
                      onChange={(e) => setGroupModalBatchSize(e.target.value)}
                      placeholder="e.g. 7, 8, M, L"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={groupModalBatchCost}
                      onChange={(e) => setGroupModalBatchCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={groupModalBatchSelling}
                      onChange={(e) => setGroupModalBatchSelling(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">SKU Prefix (Optional)</label>
                    <input
                      type="text"
                      value={groupModalBatchSkuPrefix}
                      onChange={(e) => setGroupModalBatchSkuPrefix(e.target.value)}
                      placeholder="e.g. SKU-RING"
                      className="w-full h-9 rounded-none border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Informational callout */}
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-none text-xs text-purple-800 flex items-center gap-2.5">
                <Layers size={16} className="shrink-0 text-purple-600" />
                <span>
                  Adding <strong>{groupModalBatchQuantity || "1"}</strong> items will generate <strong>{groupModalBatchQuantity || "1"}</strong> separate line rows with individual serial SKUs (1.00 qty each) linked to this group.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGroupItemModal(false)}
                className="h-9 px-4 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGroupItemModal}
                className="h-9 px-5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                Create {groupModalBatchQuantity || 1} Items
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-5xl rounded-none bg-white shadow-2xl border border-[#e5e7eb] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e7eb] p-4 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]">
              <div>
                <h2 className="text-lg font-semibold text-white">Bulk Add Items</h2>
                <p className="text-sm text-blue-100 mt-1">
                  Selected: {bulkScannedItems.length} items • Total Qty: {bulkScannedItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <button
                onClick={handleBulkAddClose}
                className="text-white hover:bg-white/20 rounded-none p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Items List */}
              <div className="flex-1 flex flex-col border-r border-[#e5e7eb] overflow-hidden">
                <div className="border-b border-[#e5e7eb] p-4 bg-[#f9fafb]">
                  <input
                    ref={bulkScanInputRef}
                    type="text"
                    value={bulkScanInput}
                    onKeyDown={handleBulkScanKeyDown}
                    placeholder="Type to search or scan the barcode of the item"
                    className="w-full rounded-none border border-[#d7dcf5] bg-white px-4 py-2.5 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    autoFocus
                  />
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d3d3d3 #f5f5f5' }}>
                  {bulkItemsLoading ? (
                    <div className="flex items-center justify-center h-full text-[#64748b]">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb] mx-auto mb-2"></div>
                        Loading items...
                      </div>
                    </div>
                  ) : bulkItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#64748b]">
                      No items available
                    </div>
                  ) : (
                    bulkItems.map((item) => {
                      let totalStock = 0;
                      
                      if (item.warehouseStocks && Array.isArray(item.warehouseStocks)) {
                        if (!warehouse || warehouse === "All Stores") {
                          // Show total stock from all warehouses
                          totalStock = item.warehouseStocks.reduce((sum, ws) => {
                            return sum + (parseFloat(ws.availableForSale) || parseFloat(ws.stockOnHand) || 0);
                          }, 0);
                        } else {
                          // Find stock for the specific warehouse
                          const warehouseStock = item.warehouseStocks.find(ws => {
                            if (!ws.warehouse) return false;
                            
                            // Normalize warehouse names for comparison
                            const wsWarehouse = ws.warehouse.toString().toLowerCase().trim();
                            const selectedWarehouse = warehouse.toLowerCase().trim();
                            
                            // Direct match
                            if (wsWarehouse === selectedWarehouse) return true;
                            
                            // Handle warehouse mapping variations
                            const normalizedWs = mapWarehouse(ws.warehouse);
                            const normalizedSelected = mapWarehouse(warehouse);
                            
                            if (normalizedWs && normalizedSelected) {
                              return normalizedWs.toLowerCase().trim() === normalizedSelected.toLowerCase().trim();
                            }
                            
                            return false;
                          });
                          
                          totalStock = warehouseStock ? (parseFloat(warehouseStock.availableForSale) || parseFloat(warehouseStock.stockOnHand) || 0) : 0;
                        }
                      }
                      
                      const isOutOfStock = totalStock <= 0;
                      const isSelected = bulkScannedItems.some(s => s.item._id === item._id);
                      
                      return (
                        <div
                          key={item._id}
                          onClick={() => !isOutOfStock && processBulkScan(item.sku)}
                          className={`p-3 rounded-none border transition-all ${
                            isOutOfStock
                              ? "border-[#fee2e2] bg-[#fef2f2] cursor-not-allowed opacity-50"
                              : isSelected
                              ? "border-[#2563eb] bg-[#eff6ff]"
                              : "border-[#e5e7eb] bg-white hover:border-[#2563eb] cursor-pointer"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${isOutOfStock ? "text-[#dc2626]" : "text-[#1f2937]"}`}>
                                {item.itemName}
                              </div>
                              <div className="text-xs text-[#64748b] mt-1">
                                SKU: {item.sku || "N/A"}
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className={`text-xs ${isOutOfStock ? "text-[#dc2626]" : "text-[#64748b]"}`}>
                                {isOutOfStock ? "No Stock" : "Stock"}
                              </div>
                              <div className={`text-sm font-medium mt-0.5 ${isOutOfStock ? "text-[#dc2626]" : "text-[#10b981]"}`}>
                                {totalStock.toFixed(0)} pcs
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right: Selected Items */}
              <div className="w-80 flex flex-col border-l border-[#e5e7eb] bg-[#f9fafb] overflow-hidden">
                <div className="border-b border-[#e5e7eb] p-4 bg-white">
                  <h3 className="font-semibold text-sm text-[#1f2937]">Selected Items</h3>
                </div>

                {/* Selected Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d3d3d3 #f5f5f5' }}>
                  {bulkScannedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#94a3b8] text-sm">
                      No items selected
                    </div>
                  ) : (
                    bulkScannedItems.map((scanned, idx) => (
                      <div key={idx} className="p-3 rounded-none bg-white border border-[#e5e7eb]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#1f2937] truncate">
                              {scanned.item.itemName}
                            </div>
                            <div className="text-xs text-[#64748b] mt-0.5">
                              {scanned.sku}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setBulkScannedItems(bulkScannedItems.filter((_, i) => i !== idx));
                            }}
                            className="text-[#ef4444] hover:text-[#dc2626] transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (scanned.quantity > 1) {
                                const updated = [...bulkScannedItems];
                                updated[idx].quantity -= 1;
                                setBulkScannedItems(updated);
                              }
                            }}
                            className="flex-1 rounded-none border border-[#d7dcf5] bg-white px-2 py-1.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={scanned.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              const updated = [...bulkScannedItems];
                              updated[idx].quantity = Math.max(1, newQty);
                              setBulkScannedItems(updated);
                            }}
                            className="w-16 rounded-none border border-[#d7dcf5] bg-white px-2 py-1.5 text-center text-sm text-[#1f2937] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                          />
                          <button
                            onClick={() => {
                              const updated = [...bulkScannedItems];
                              updated[idx].quantity += 1;
                              setBulkScannedItems(updated);
                            }}
                            className="flex-1 rounded-none border border-[#d7dcf5] bg-white px-2 py-1.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-[#e5e7eb] p-4 bg-white flex gap-2">
                  <button
                    onClick={handleBulkAddClose}
                    className="flex-1 rounded-none border border-[#d7dcf5] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAddItems}
                    disabled={bulkScannedItems.length === 0}
                    className="flex-1 rounded-none bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Items ({bulkScannedItems.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Bills = () => {
  const isSidebarOpen = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewBill = location.pathname === "/purchase/bills/new";
  const isEditBill = id && location.pathname.includes("/edit");
  const API_URL = baseUrl?.baseUrl?.replace(/\/$/, "") || "http://localhost:7000";

  // Fetch bills from MongoDB
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [showLinkPOModal, setShowLinkPOModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isNewBill || isEditBill) return; // Don't fetch if we're on the new or edit bill page

    const fetchBills = async () => {
      setLoading(true);
      try {
        // Get user info - use email as primary identifier
        const userStr = localStorage.getItem("rootfinuser");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.email || null;
        const userPower = user?.power || "";

        if (!userId) {
          setBills([]);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          userId: userId,
        });
        if (userPower) params.append("userPower", userPower);
        if (user?.locCode) params.append("locCode", user.locCode);
        
        // Add warehouse parameter for filtering
        const fallbackLocations = [
          { "locName": "Z-Edapally1", "locCode": "144" },
          { "locName": "Warehouse", "locCode": "858" },
          { "locName": "G-Edappally", "locCode": "702" },
          { "locName": "HEAD OFFICE01", "locCode": "759" },
          { "locName": "SG-Trivandrum", "locCode": "700" },
          { "locName": "Z- Edappal", "locCode": "100" },
          { "locName": "Z.Perinthalmanna", "locCode": "133" },
          { "locName": "Z.Kottakkal", "locCode": "122" },
          { "locName": "G.Kottayam", "locCode": "701" },
          { "locName": "G.Perumbavoor", "locCode": "703" },
          { "locName": "G.Thrissur", "locCode": "704" },
          { "locName": "G.Chavakkad", "locCode": "706" },
          { "locName": "G.Calicut ", "locCode": "712" },
          { "locName": "G.Vadakara", "locCode": "708" },
          { "locName": "G.Edappal", "locCode": "707" },
          { "locName": "G.Perinthalmanna", "locCode": "709" },
          { "locName": "G.Kottakkal", "locCode": "711" },
          { "locName": "G.Manjeri", "locCode": "710" },
          { "locName": "G.Palakkad ", "locCode": "705" },
          { "locName": "G.Kalpetta", "locCode": "717" },
          { "locName": "G.Kannur", "locCode": "716" },
          { "locName": "G.Mg Road", "locCode": "718" },
          { "locName": "Production", "locCode": "101" },
          { "locName": "Office", "locCode": "102" },
          { "locName": "WAREHOUSE", "locCode": "103" }
        ];
        
        let userLocName = "";
        if (user?.locCode) {
          const location = fallbackLocations.find(loc => loc.locCode === user.locCode || loc.locCode === String(user.locCode));
          if (location) {
            userLocName = location.locName;
          }
        }
        if (!userLocName) {
          userLocName = user?.username || user?.locName || "";
        }
        
        const userWarehouse = mapWarehouse(userLocName);
        if (userWarehouse) {
          params.append("warehouse", userWarehouse);
        }
        
        const response = await fetch(`${API_URL}/api/purchase/bills?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        const data = await response.json();
        setBills(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading bills:", error);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [isNewBill, isEditBill, API_URL]);

  // Format date from Date object or string to dd/MM/yyyy
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  };

  // Calculate days between two dates (returns positive number for overdue)
  const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d1 - d2; // Positive if date1 is after date2
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Process bills for display
  let processedBills = bills.map(bill => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);
    
    const billDate = bill.billDate ? new Date(bill.billDate) : null;
    
    // Use manual status from database if set, otherwise calculate based on due date
    let status = bill.status?.toLowerCase() || "completed";
    let isOverdue = false;
    let overdueDays = 0;
    
    // Calculate balance due to check if bill is paid
    // Note: balanceDue is calculated from finalTotal (bills don't have a separate balanceDue field)
    const balanceDue = parseFloat(bill.finalTotal) || 0;
    
    // Check if bill is completed/paid - if status is "completed", "paid", or "cancelled", never mark as overdue
    const isCompletedStatus = bill.status === "completed" || 
                              bill.status === "paid" || 
                              bill.status === "cancelled";
    const isPaidOrCompleted = balanceDue === 0 || isCompletedStatus;
    
    // Calculate if overdue based on due date
    // But preserve explicit draft status - don't override it
    const isExplicitDraft = bill.status === "draft";
    
    // IMPORTANT: If bill status is "completed", "paid", or "cancelled", NEVER mark as overdue
    // This ensures that once a bill is saved as completed, it won't go back to overdue
    if (isCompletedStatus) {
      // Bill is already completed/paid - preserve status, don't calculate overdue
      isOverdue = false;
      overdueDays = 0;
      // Keep the completed/paid status
      status = bill.status === "paid" ? "paid" : "completed";
    } else if (dueDate && !isExplicitDraft && !isPaidOrCompleted) {
      // Only calculate overdue for bills that are NOT completed/paid
      if (dueDate < today) {
        isOverdue = true;
        overdueDays = daysBetween(today, dueDate);
        // Only set to overdue if status is "open", "sent", or not set
        // Don't override if already "completed", "paid", or "cancelled"
        if (!bill.status || bill.status === "open" || bill.status === "sent") {
          status = "overdue";
        }
      } else if (dueDate.getTime() === today.getTime()) {
        if (!bill.status) {
          status = "completed";
        }
      }
    } else if (dueDate && isExplicitDraft) {
      // Still calculate overdue days for display, but keep status as draft
      if (dueDate < today) {
        isOverdue = true;
        overdueDays = daysBetween(today, dueDate);
      }
    } else if (isPaidOrCompleted && !isCompletedStatus) {
      // If balance is 0 but status isn't explicitly completed, mark as completed
      isOverdue = false;
      overdueDays = 0;
      if (!bill.status || bill.status === "overdue") {
        status = "completed"; // Set to completed if it was overdue but balance is now 0
      }
    }

    // Normalize status values: map database values to display values
    // Map to uppercase for display
    if (status === "draft") status = "DRAFT";
    else if (status === "unpaid") status = "UNPAID";
    else if (status === "overdue") status = "OVERDUE";
    else if (status === "complete" || status === "completed" || status === "open") status = "COMPLETED"; // Treat open/completed as completed for display
    else if (status === "paid") status = "COMPLETED"; // Treat paid as completed for display
    else if (status === "sent") status = "COMPLETED";
    else if (status === "cancelled") status = "COMPLETED";
    else status = "COMPLETED"; // Default to COMPLETED
    
    // Final safeguard: If bill is paid/completed (balanceDue = 0 or status is completed/paid), ensure it's not overdue
    if (isPaidOrCompleted || isCompletedStatus) {
      if (status === "OVERDUE") {
        status = "COMPLETED"; // Override overdue if bill is paid/completed
      }
      isOverdue = false;
      overdueDays = 0;
    }

    return {
      _id: bill._id,
      date: formatDate(bill.billDate),
      branch: bill.branch || "Warehouse",
      billNumber: bill.billNumber || "",
      referenceNumber: bill.orderNumber || "",
      vendorName: bill.vendorName || "",
      status: status,
      originalStatus: bill.status || "completed", // Store original status for API
      dueDate: formatDate(bill.dueDate),
      amount: `₹${(parseFloat(bill.finalTotal) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      balanceDue: `₹${balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      isOverdue: isOverdue,
      overdueDays: overdueDays,
      finalTotal: parseFloat(bill.finalTotal) || 0,
      dueDateObj: dueDate,
      purchaseOrderId: bill.purchaseOrderId,
      purchaseReceiveId: bill.purchaseReceiveId,
      vendorId: bill.vendorId,
      items: bill.items,
      warehouse: bill.warehouse,
      locCode: bill.locCode,
      orderNumber: bill.orderNumber,
    };
  });

  // Filter bills based on search term
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    processedBills = processedBills.filter(bill =>
      bill.billNumber.toLowerCase().includes(searchLower) ||
      bill.vendorName.toLowerCase().includes(searchLower) ||
      bill.referenceNumber.toLowerCase().includes(searchLower) ||
      bill.branch.toLowerCase().includes(searchLower)
    );
  }

  // Handle checkbox selection
  const handleSelectBill = (billId, event) => {
    event.stopPropagation();
    const newSelected = new Set(selectedBills);
    if (newSelected.has(billId)) {
      newSelected.delete(billId);
    } else {
      newSelected.add(billId);
    }
    setSelectedBills(newSelected);
  };

  // Handle select all
  const handleSelectAll = (event) => {
    event.stopPropagation();
    if (selectedBills.size === processedBills.length) {
      setSelectedBills(new Set());
    } else {
      setSelectedBills(new Set(processedBills.map(b => b._id)));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedBills(new Set());
  };

  // Handle status update
  const handleStatusUpdate = async (billId, newStatus, event) => {
    event.stopPropagation();
    
    try {
      // Map display status to backend status
      const statusMap = {
        "DRAFT": "draft",
        "OVERDUE": "overdue",
        "UNPAID": "unpaid",
        "COMPLETED": "completed",
        "DUE_TODAY": "completed",
        "COMPLETE": "completed"
      };
      
      const backendStatus = statusMap[newStatus] || "completed";
      
      // Get user info
      const userStr = localStorage.getItem("rootfinuser");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.email || null;
      
      // Find the original bill data from bills array (not processedBills)
      // bills array contains the original MongoDB data with all fields
      const originalBill = bills.find(b => b._id === billId);
      if (!originalBill) {
        alert("Bill not found");
        return;
      }
      
      // Prepare update data - use original bill data to ensure all fields are present
      const updateData = {
        ...originalBill,
        status: backendStatus,
        userId: userId,
        // Ensure critical fields are present and properly formatted
        items: originalBill.items || [],
        warehouse: originalBill.warehouse || originalBill.branch || "Warehouse",
        sourceType: originalBill.sourceType || "direct",
        finalTotal: parseFloat(originalBill.finalTotal) || 0,
        vendorId: originalBill.vendorId || null,
        locCode: originalBill.locCode || user?.locCode || "",
      };
      
      console.log(`\n📋 Updating bill ${billId} status from "${originalBill.status || 'draft'}" to "${backendStatus}"`);
      console.log(`Items count: ${updateData.items?.length || 0}`);
      console.log(`Source type: ${updateData.sourceType}`);
      console.log(`Warehouse: ${updateData.warehouse}`);
      console.log(`Final Total: ${updateData.finalTotal}`);
      if (updateData.items && updateData.items.length > 0) {
        console.log(`Item details:`, updateData.items.map(item => ({
          name: item.itemName,
          qty: parseFloat(item.quantity) || 0,
          itemId: item.itemId,
          itemGroupId: item.itemGroupId
        })));
      }
      
      // Update bill status
      const response = await fetch(`${API_URL}/api/purchase/bills/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update bill status");
      }
      
      // Refresh bills list
      const fetchBills = async () => {
        try {
          const userPower = user?.power || "";
          const billsResponse = await fetch(`${API_URL}/api/purchase/bills?userId=${encodeURIComponent(userId)}${userPower ? `&userPower=${encodeURIComponent(userPower)}` : ""}`);
          if (billsResponse.ok) {
            const data = await billsResponse.json();
            setBills(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error("Error refreshing bills:", error);
        }
      };
      
      await fetchBills();
    } catch (error) {
      console.error("Error updating bill status:", error);
      alert("Failed to update bill status. Please try again.");
    }
  };

  // Get selected bills data
  const getSelectedBillsData = () => {
    return bills.filter(bill => selectedBills.has(bill._id));
  };

  // Handle Email Bills
  const handleEmailBills = () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      alert("Please select at least one bill");
      return;
    }
    // TODO: Implement email functionality
    alert(`Email functionality for ${selected.length} bill(s) - To be implemented`);
  };

  // Handle Print Bills
  const handlePrintBills = () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      alert("Please select at least one bill");
      return;
    }
    // Open each bill in a new window for printing
    selected.forEach(bill => {
      window.open(`/purchase/bills/${bill._id}?print=true`, '_blank');
    });
  };

  // Handle Download Bills
  const handleDownloadBills = () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      alert("Please select at least one bill");
      return;
    }
    // TODO: Implement download functionality (PDF/CSV)
    alert(`Download functionality for ${selected.length} bill(s) - To be implemented`);
  };

  // Handle Mark as Received
  const handleMarkAsReceived = async () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      alert("Please select at least one bill");
      return;
    }

    // Check if bills have purchase orders
    const billsWithoutPO = selected.filter(bill => !bill.purchaseOrderId);
    if (billsWithoutPO.length > 0) {
      alert(`Cannot mark as received: ${billsWithoutPO.length} bill(s) do not have a linked Purchase Order. Please link a PO first.`);
      return;
    }

    if (!confirm(`Create Purchase Receive entries for ${selected.length} selected bill(s)? This will increase stock.`)) {
      return;
    }

    try {
      const userStr = localStorage.getItem("rootfinuser");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.email || null;
      let successCount = 0;
      let failCount = 0;

      for (const bill of selected) {
        try {
          if (!bill.purchaseOrderId) {
            failCount++;
            continue;
          }

          // Get the purchase order to get receive number format
          const poResponse = await fetch(`${API_URL}/api/purchase/orders/${bill.purchaseOrderId}`);
          if (!poResponse.ok) {
            throw new Error("Failed to fetch purchase order");
          }
          const purchaseOrder = await poResponse.json();

          // Generate receive number
          const receiveNumber = `GRN-${bill.billNumber}-${Date.now()}`;

          // Create a purchase receive from the bill
          const response = await fetch(`${API_URL}/api/purchase/receives`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              purchaseOrderId: bill.purchaseOrderId,
              purchaseOrderNumber: purchaseOrder.orderNumber || bill.orderNumber,
              vendorId: bill.vendorId,
              vendorName: bill.vendorName,
              receiveNumber: receiveNumber,
              receivedDate: new Date().toISOString(),
              items: (bill.items || []).map(item => ({
                itemId: item.itemId,
                itemName: item.itemName,
                itemSku: item.itemSku,
                itemDescription: item.itemDescription,
                ordered: item.quantity || 0,
                received: item.quantity || 0,
                inTransit: 0,
                quantityToReceive: 0,
                itemGroupId: item.itemGroupId,
              })),
              warehouse: bill.warehouse || "Warehouse",
              userId: userId,
              locCode: bill.locCode || "",
              notes: `Created from Bill ${bill.billNumber}`,
              status: "received",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create purchase receive");
          }

          const receiveData = await response.json();

          // Update bill to link the receive
          await fetch(`${API_URL}/api/purchase/bills/${bill._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...bill,
              purchaseReceiveId: receiveData._id,
            }),
          });

          successCount++;
        } catch (error) {
          console.error(`Error creating receive for bill ${bill.billNumber}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully created purchase receives for ${successCount} bill(s)${failCount > 0 ? `. ${failCount} failed.` : ''}`);
        setSelectedBills(new Set());
        // Refresh bills list
        window.location.reload();
      } else {
        alert(`Failed to create purchase receives. Please try again.`);
      }
    } catch (error) {
      console.error("Error marking bills as received:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle Undo Receive
  const handleUndoReceive = async () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      alert("Please select at least one bill");
      return;
    }

    // Check if bills have purchase receives
    const billsWithoutReceive = selected.filter(bill => !bill.purchaseReceiveId);
    if (billsWithoutReceive.length > 0) {
      alert(`Cannot undo receive: ${billsWithoutReceive.length} bill(s) do not have a linked Purchase Receive.`);
      return;
    }

    if (!confirm(`Undo receive for ${selected.length} selected bill(s)? This will decrease stock.`)) {
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const bill of selected) {
        try {
          if (!bill.purchaseReceiveId) {
            failCount++;
            continue;
          }

          // Delete the purchase receive linked to this bill
          const deleteResponse = await fetch(`${API_URL}/api/purchase/receives/${bill.purchaseReceiveId}`, {
            method: "DELETE",
          });

          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.message || "Failed to delete purchase receive");
          }

          // Update bill to remove the receive link
          await fetch(`${API_URL}/api/purchase/bills/${bill._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...bill,
              purchaseReceiveId: null,
            }),
          });

          successCount++;
        } catch (error) {
          console.error(`Error undoing receive for bill ${bill.billNumber}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully undone receives for ${successCount} bill(s)${failCount > 0 ? `. ${failCount} failed.` : ''}`);
        setSelectedBills(new Set());
        // Refresh bills list
        window.location.reload();
      } else {
        alert(`Failed to undo receives. Please try again.`);
      }
    } catch (error) {
      console.error("Error undoing receives:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle Delete Bills
  const handleDeleteBills = async () => {
    const selected = getSelectedBillsData();
    if (selected.length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selected.length} bill(s)? This action cannot be undone and will affect payments, stock, and purchase orders.`)) {
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const bill of selected) {
        try {
          const response = await fetch(`${API_URL}/api/purchase/bills/${bill._id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete bill");
          }
        } catch (error) {
          console.error(`Error deleting bill ${bill.billNumber}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully deleted ${successCount} bill(s)${failCount > 0 ? `. ${failCount} failed.` : ''}`);
        setSelectedBills(new Set());
        setShowDeleteConfirm(false);
        // Refresh bills list
        window.location.reload();
      } else {
        alert(`Failed to delete bills. Please try again.`);
      }
    } catch (error) {
      console.error("Error deleting bills:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isNewBill || isEditBill) {
    return <NewBillForm billId={id} isEditMode={isEditBill} />;
  }

  return (
    <>
      <Header title="Bills" />
      <div className={`transition-all duration-300 min-h-screen bg-[#f8fafc] p-6 md:p-8 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header Title & New Bill button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
              Bills
            </h1>
            {!loading && (
              <span className="px-3 py-1 rounded-full bg-[#e2e8f0] text-xs font-semibold text-[#475569]">
                {processedBills.length} {processedBills.length === 1 ? 'bill' : 'bills'}
              </span>
            )}
          </div>
          <Link
            to="/purchase/bills/new"
            className="inline-flex items-center gap-2 rounded-none bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span>New Bill</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#9ca3af]" size={18} />
            <input
              type="text"
              placeholder="Search by bill number, vendor, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-none border border-[#e2e8f0] bg-white text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#8B5CF6] shadow-sm transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] hover:text-[#4b5563]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Bar - Show when bills are selected */}
        {selectedBills.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-none border border-[#e5e7eb] shadow-sm p-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                {selectedBills.size} {selectedBills.size === 1 ? 'Bill' : 'Bills'} Selected
              </span>
              <button
                onClick={handleClearSelection}
                className="text-xs text-[#6b7280] hover:text-[#111827] flex items-center gap-1 font-medium transition-colors"
              >
                <X size={14} />
                Clear Selection
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="h-8 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                Bulk Update
              </button>
              <button
                onClick={() => handleEmailBills()}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <Mail size={14} />
                Email
              </button>
              <button
                onClick={() => handlePrintBills()}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={() => handleDownloadBills()}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={() => setShowBulkPaymentModal(true)}
                className="h-8 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                Record Bulk Payment
              </button>
              <button
                onClick={() => setShowLinkPOModal(true)}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <LinkIcon size={14} />
                Link to PO
              </button>
              <button
                onClick={() => handleMarkAsReceived()}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <Package size={14} />
                Mark Received
              </button>
              <button
                onClick={() => handleUndoReceive()}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[#111827] bg-[#eeeeee] hover:bg-[#e2e2e2] border border-[#e5e7eb] rounded-none transition-colors"
              >
                <PackageX size={14} />
                Undo Receive
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-none transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Bills Table */}
        <div className="rounded-none border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-full text-left text-xs">
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr className="bg-[#1e1e1e] text-white text-xs uppercase tracking-wide font-bold">
                  <th scope="col" className="px-3 py-3 text-center border-r border-[#333333] text-xs font-bold uppercase tracking-wider text-white w-12">
                    <input
                      type="checkbox"
                      checked={selectedBills.size === processedBills.length && processedBills.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded-none border-gray-600 bg-gray-800 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="px-3 py-3 text-center border-r border-[#333333] text-xs font-bold uppercase tracking-wider text-white w-14">
                    #
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    DATE
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    BILL #
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    VENDOR
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    STATUS
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    DUE DATE
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-white border-r border-[#333333]">
                    AMOUNT
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-white">
                    BALANCE DUE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-7 w-7 animate-spin rounded-none border-2 border-[#1e1e1e] border-t-transparent"></div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading bills...</p>
                      </div>
                    </td>
                  </tr>
                ) : processedBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-none bg-[#f1f5f9] flex items-center justify-center mb-4">
                          <Search className="text-[#94a3b8]" size={24} />
                        </div>
                        <p className="text-sm font-bold text-[#111827] uppercase tracking-wide mb-1">
                          {searchTerm ? "No bills found" : "No bills yet"}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          {searchTerm ? "Try adjusting your search query" : "Create your first bill to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedBills.map((bill, index) => (
                    <tr
                      key={bill._id || bill.id}
                      className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer group ${selectedBills.has(bill._id) ? 'bg-[#f0f7ff]' : ''}`}
                      onClick={() => {
                        if (bill._id || bill.id) {
                          navigate(`/purchase/bills/${bill._id || bill.id}`);
                        } else {
                          console.error("Bill ID is missing:", bill);
                        }
                      }}
                    >
                      <td 
                        className="px-3 py-2.5 whitespace-nowrap border-r border-gray-100 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBills.has(bill._id)}
                          onChange={(e) => handleSelectBill(bill._id, e)}
                          className="h-4 w-4 rounded-none border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap border-r border-gray-100 text-center text-xs text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-700 border-r border-gray-100">
                        {bill.date}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs border-r border-gray-100">
                        <span className="font-bold text-[#8B5CF6] group-hover:text-[#7C3AED] group-hover:underline">
                          {bill.billNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-800 font-medium border-r border-gray-100">
                        {bill.vendorName}
                      </td>
                      <td 
                        className="px-3 py-2.5 whitespace-nowrap text-xs border-r border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={bill.status}
                          onChange={(e) => handleStatusUpdate(bill._id, e.target.value, e)}
                          className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-offset-1 transition-colors cursor-pointer ${
                            bill.status === "DRAFT"
                              ? "bg-[#f1f5f9] text-[#475569]"
                              : bill.status === "OVERDUE"
                              ? "bg-[#fee2e2] text-[#dc2626]"
                              : bill.status === "UNPAID"
                              ? "bg-[#fef3c7] text-[#d97706]"
                              : "bg-[#dcfce7] text-[#15803d]"
                          }`}
                          style={{
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${bill.status === "DRAFT" ? "%23475569" : bill.status === "OVERDUE" ? "%23dc2626" : bill.status === "UNPAID" ? "%23d97706" : "%2315803d"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            paddingRight: '1.5rem',
                          }}
                        >
                          <option value="DRAFT" className="bg-white text-[#475569]">Draft</option>
                          {bill.isOverdue ? (
                            <option value="OVERDUE" className="bg-white text-[#dc2626]">Overdue {bill.overdueDays > 0 ? `${bill.overdueDays}d` : ''}</option>
                          ) : (
                            <option value="OVERDUE" className="bg-white text-[#dc2626]">Overdue</option>
                          )}
                          <option value="UNPAID" className="bg-white text-[#d97706]">Unpaid</option>
                          <option value="COMPLETED" className="bg-white text-[#15803d]">Completed</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600 border-r border-gray-100">
                        {bill.dueDate}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs font-bold text-gray-900 text-right border-r border-gray-100">
                        {bill.amount}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs font-bold text-gray-900 text-right">
                        {bill.balanceDue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1e293b]">Bulk Update Bills</h2>
                <button
                  onClick={() => setShowBulkUpdateModal(false)}
                  className="text-[#64748b] hover:text-[#1e293b]"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#64748b] mb-4">
                Update {selectedBills.size} selected bill(s)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm">
                    <option value="">No change</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBulkUpdateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-none hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement bulk update
                    alert("Bulk update functionality - To be implemented");
                    setShowBulkUpdateModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-none hover:bg-[#1d4ed8]"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Payment Modal */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1e293b]">Record Bulk Payment</h2>
                <button
                  onClick={() => setShowBulkPaymentModal(false)}
                  className="text-[#64748b] hover:text-[#1e293b]"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#64748b] mb-4">
                Record payment for {selectedBills.size} selected bill(s)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Payment Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Payment Method</label>
                  <select className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm">
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBulkPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-none hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement bulk payment
                    alert("Bulk payment functionality - To be implemented");
                    setShowBulkPaymentModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-none hover:bg-[#1d4ed8]"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link to PO Modal */}
      {showLinkPOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1e293b]">Link to Purchase Order</h2>
                <button
                  onClick={() => setShowLinkPOModal(false)}
                  className="text-[#64748b] hover:text-[#1e293b]"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#64748b] mb-4">
                Link {selectedBills.size} selected bill(s) to a purchase order
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-2">Purchase Order Number</label>
                  <input
                    type="text"
                    placeholder="Enter PO number"
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowLinkPOModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-none hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement link to PO
                    alert("Link to PO functionality - To be implemented");
                    setShowLinkPOModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-none hover:bg-[#1d4ed8]"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-none shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1e293b]">Delete Bills</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[#64748b] hover:text-[#1e293b]"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#64748b] mb-4">
                Are you sure you want to delete {selectedBills.size} selected bill(s)? This action cannot be undone and will:
              </p>
              <ul className="text-sm text-[#64748b] mb-4 list-disc list-inside space-y-1">
                <li>Reverse any payments made</li>
                <li>Reverse accounting journal entries</li>
                <li>Reduce billed amounts in Purchase Orders</li>
                <li>Delete linked Purchase Receives (if created from bill)</li>
                <li>Reverse stock increases (if applicable)</li>
              </ul>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-none hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBills}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#ef4444] rounded-none hover:bg-[#dc2626]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Bills;

