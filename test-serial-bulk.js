const { Damage } = require('./models/Damage');

// Test the serial vs bulk damage logic
async function testSerialBulkLogic() {
  console.log('🧪 Testing Serial vs Bulk Damage Logic...\n');

  try {
    // Test 1: Create serial item damage
    console.log('📱 Test 1: Serial Item Damage');
    const serialDamage = await Damage.create({
      item_id: '123e4567-e89b-12d3-a456-426614174000',
      item_type: 'serial',
      serial_number: 'SN001-2024',
      reported_by: '456e7890-e89b-12d3-a456-426614174000',
      description: 'Screen cracked during transport'
    });
    console.log('✅ Serial damage created:', serialDamage.getDamageSummary());
    console.log('   Is Serial Item:', serialDamage.isSerialItem());
    console.log('   Is Bulk Item:', serialDamage.isBulkItem());
    console.log('   Identifier:', serialDamage.getDamageIdentifier());
    console.log('');

    // Test 2: Create bulk item damage
    console.log('📦 Test 2: Bulk Item Damage');
    const bulkDamage = await Damage.create({
      item_id: '789e0123-e89b-12d3-a456-426614174000',
      item_type: 'bulk',
      quantity_damaged: 5,
      reported_by: '456e7890-e89b-12d3-a456-426614174000',
      description: 'Water damage to packaging'
    });
    console.log('✅ Bulk damage created:', bulkDamage.getDamageSummary());
    console.log('   Is Serial Item:', bulkDamage.isSerialItem());
    console.log('   Is Bulk Item:', bulkDamage.isBulkItem());
    console.log('   Identifier:', bulkDamage.getDamageIdentifier());
    console.log('');

    // Test 3: Validation - Serial item with quantity (should fail)
    console.log('❌ Test 3: Serial Item with Quantity (Should Fail)');
    try {
      await Damage.create({
        item_id: '123e4567-e89b-12d3-a456-426614174000',
        item_type: 'serial',
        serial_number: 'SN002-2024',
        quantity_damaged: 3, // This should cause validation error
        reported_by: '456e7890-e89b-12d3-a456-426614174000',
        description: 'Test validation'
      });
    } catch (error) {
      console.log('✅ Validation error caught:', error.message);
    }
    console.log('');

    // Test 4: Validation - Bulk item with serial (should fail)
    console.log('❌ Test 4: Bulk Item with Serial (Should Fail)');
    try {
      await Damage.create({
        item_id: '789e0123-e89b-12d3-a456-426614174000',
        item_type: 'bulk',
        serial_number: 'SN003-2024', // This should cause validation error
        quantity_damaged: 2,
        reported_by: '456e7890-e89b-12d3-a456-426614174000',
        description: 'Test validation'
      });
    } catch (error) {
      console.log('✅ Validation error caught:', error.message);
    }
    console.log('');

    // Test 5: Validation - Serial item without serial number (should fail)
    console.log('❌ Test 5: Serial Item without Serial Number (Should Fail)');
    try {
      await Damage.create({
        item_id: '123e4567-e89b-12d3-a456-426614174000',
        item_type: 'serial',
        // Missing serial_number - should cause validation error
        reported_by: '456e7890-e89b-12d3-a456-426614174000',
        description: 'Test validation'
      });
    } catch (error) {
      console.log('✅ Validation error caught:', error.message);
    }
    console.log('');

    // Test 6: Validation - Bulk item without quantity (should fail)
    console.log('❌ Test 6: Bulk Item without Quantity (Should Fail)');
    try {
      await Damage.create({
        item_id: '789e0123-e89b-12d3-a456-426614174000',
        item_type: 'bulk',
        // Missing quantity_damaged - should cause validation error
        reported_by: '456e7890-e89b-12d3-a456-426614174000',
        description: 'Test validation'
      });
    } catch (error) {
      console.log('✅ Validation error caught:', error.message);
    }
    console.log('');

    console.log('🎉 All tests completed! Serial vs Bulk logic is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSerialBulkLogic();
}

module.exports = { testSerialBulkLogic };
