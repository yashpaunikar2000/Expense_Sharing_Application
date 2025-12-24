const express = require('express');
const balanceController = require('../controllers/balanceController');

const router = express.Router();

// Balance and settlement routes
router.get('/:groupId/balance', balanceController.getUserBalance);
router.get('/:groupId/balances', balanceController.getGroupBalances);
router.get('/:groupId/settlements/suggestions', balanceController.getSettlementSuggestions);
router.post('/:groupId/settlements', balanceController.recordSettlement);
router.get('/:groupId/settlements', balanceController.getGroupSettlements);
router.get('/:groupId/settlements/user', balanceController.getUserSettlements);
router.get('/settlements/:settlementId', balanceController.getSettlementDetails);

module.exports = router;
