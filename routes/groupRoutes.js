const express = require('express');
const groupController = require('../controllers/groupController');

const router = express.Router();

// Group routes
router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:groupId', groupController.getGroupDetails);
router.put('/:groupId', groupController.updateGroup);
router.delete('/:groupId', groupController.deleteGroup);
router.post('/:groupId/members', groupController.addMemberToGroup);
router.delete('/:groupId/members/:memberId', groupController.removeMemberFromGroup);

module.exports = router;
