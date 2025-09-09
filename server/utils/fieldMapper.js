/**
 * Utility functions for mapping between frontend camelCase and backend snake_case
 */

/**
 * Convert snake_case object to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function toCamelCase(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (typeof obj === 'object') {
    const camelCaseObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = toCamelCase(value);
    }
    return camelCaseObj;
  }
  
  return obj;
}

/**
 * Convert camelCase object to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
function toSnakeCase(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (typeof obj === 'object') {
    const snakeCaseObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = toSnakeCase(value);
    }
    return snakeCaseObj;
  }
  
  return obj;
}

/**
 * Map item fields from database to frontend format
 * @param {Object} item - Item from database
 * @returns {Object} Item formatted for frontend
 */
function mapItemToFrontend(item) {
  if (!item) return null;
  
  const mapped = toCamelCase(item.toJSON ? item.toJSON() : item);
  
  // Special mappings for frontend compatibility
  if (mapped.itemId) {
    mapped.id = mapped.itemId;
  }
  
  // Map amount to quantity for frontend
  if (mapped.amount !== undefined) {
    mapped.quantity = mapped.amount;
  }
  
  // Map low_stock_threshold to minStockLevel
  if (mapped.lowStockThreshold !== undefined) {
    mapped.minStockLevel = mapped.lowStockThreshold;
  }
  
  // Map max_stock_level to maxStockLevel
  if (mapped.maxStockLevel !== undefined) {
    mapped.maxStockLevel = mapped.maxStockLevel;
  }
  
  // Map serial_number to serialNumber
  if (mapped.serialNumber !== undefined) {
    mapped.serialNumber = mapped.serialNumber;
  }
  
  // Map purchase_date to purchaseDate
  if (mapped.purchaseDate !== undefined) {
    mapped.purchaseDate = mapped.purchaseDate;
  }
  
  // Map purchase_price to purchasePrice
  if (mapped.purchasePrice !== undefined) {
    mapped.purchasePrice = mapped.purchasePrice;
  }
  
  // Map warranty_expiry to warrantyExpiry
  if (mapped.warrantyExpiry !== undefined) {
    mapped.warrantyExpiry = mapped.warrantyExpiry;
  }
  
  // Map image_path to imageUrl
  if (mapped.imagePath !== undefined) {
    mapped.imageUrl = mapped.imagePath;
  }
  
  return mapped;
}

/**
 * Map user fields from database to frontend format
 * @param {Object} user - User from database
 * @returns {Object} User formatted for frontend
 */
function mapUserToFrontend(user) {
  if (!user) return null;
  
  const mapped = toCamelCase(user.toJSON ? user.toJSON() : user);
  
  // Special mappings for frontend compatibility
  if (mapped.userId) {
    mapped.id = mapped.userId;
  }
  
  // Map store_id to storeId
  if (mapped.storeId !== undefined) {
    mapped.storeId = mapped.storeId;
  }
  
  return mapped;
}

/**
 * Map frontend item data to database format
 * @param {Object} itemData - Item data from frontend
 * @returns {Object} Item data formatted for database
 */
function mapItemFromFrontend(itemData) {
  if (!itemData) return null;
  
  const mapped = toSnakeCase(itemData);
  
  // Special mappings for database compatibility
  if (mapped.id) {
    mapped.item_id = mapped.id;
    delete mapped.id;
  }
  
  // Map quantity to amount
  if (mapped.quantity !== undefined) {
    mapped.amount = mapped.quantity;
    delete mapped.quantity;
  }
  
  // Map minStockLevel to low_stock_threshold
  if (mapped.minStockLevel !== undefined) {
    mapped.low_stock_threshold = mapped.minStockLevel;
    delete mapped.minStockLevel;
  }
  
  // Map maxStockLevel to max_stock_level
  if (mapped.maxStockLevel !== undefined) {
    mapped.max_stock_level = mapped.maxStockLevel;
    delete mapped.maxStockLevel;
  }
  
  // Map serialNumber to serial_number
  if (mapped.serialNumber !== undefined) {
    mapped.serial_number = mapped.serialNumber;
    delete mapped.serialNumber;
  }
  
  // Map purchaseDate to purchase_date
  if (mapped.purchaseDate !== undefined) {
    mapped.purchase_date = mapped.purchaseDate;
    delete mapped.purchaseDate;
  }
  
  // Map purchasePrice to purchase_price
  if (mapped.purchasePrice !== undefined) {
    mapped.purchase_price = mapped.purchasePrice;
    delete mapped.purchasePrice;
  }
  
  // Map warrantyExpiry to warranty_expiry
  if (mapped.warrantyExpiry !== undefined) {
    mapped.warranty_expiry = mapped.warrantyExpiry;
    delete mapped.warrantyExpiry;
  }
  
  // Map imageUrl to image_path
  if (mapped.imageUrl !== undefined) {
    mapped.image_path = mapped.imageUrl;
    delete mapped.imageUrl;
  }
  
  return mapped;
}

module.exports = {
  toCamelCase,
  toSnakeCase,
  mapItemToFrontend,
  mapUserToFrontend,
  mapItemFromFrontend
};
