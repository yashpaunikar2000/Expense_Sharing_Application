const { Group, User, Expense } = require('../models');
const mongoose = require('mongoose');
const { validateCreateGroup } = require('../utils/validators');

/**
 * Create a new group
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, members, createdBy } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ error: 'Valid createdBy userId is required' });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Members array is required' });
    }

    // Validate members (ONLY ObjectId)
    const normalizedMembers = [];
    for (const member of members) {
      if (
        !member.userId ||
        !mongoose.Types.ObjectId.isValid(member.userId)
      ) {
        return res.status(400).json({
          error: 'Each member must have a valid userId'
        });
      }

      normalizedMembers.push({
        userId: member.userId
      });
    }

    // Ensure creator is also a member
    const creatorAlreadyMember = normalizedMembers.some(
      m => m.userId.toString() === createdBy
    );

    if (!creatorAlreadyMember) {
      normalizedMembers.unshift({ userId: createdBy });
    }

    // Create group
    const newGroup = new Group({
      name,
      description,
      members: normalizedMembers,
      createdBy
    });

    const savedGroup = await newGroup.save();

    // Add group reference to users
    for (const member of normalizedMembers) {
      await User.findByIdAndUpdate(member.userId, {
        $addToSet: { groups: savedGroup._id }
      });
    }

    res.status(201).json({
      message: 'Group created successfully',
      data: savedGroup
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Error creating group' });
  }
};

/**
 * Get all groups for a user
 */
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user?.id;

    const groups = await Group.find({ 'members.userId': userId })
      .populate('members.userId', 'name email')
      .populate('createdBy', 'name email')
      .populate('expenses');

    res.json({
      message: 'Groups retrieved successfully',
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Error fetching groups' });
  }
};

/**
 * Get group details
 */
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.userId', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'expenses',
        populate: [
          { path: 'paidBy', select: 'name email' }
        ]
      });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group details retrieved successfully',
      data: group
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Error fetching group details' });
  }
};

/**
 * Add member to group
 */
const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid groupId' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Normalize input → array of { userId }
    const membersToAdd = Array.isArray(members)
      ? members
      : userId
        ? [{ userId }]
        : [];

    if (membersToAdd.length === 0) {
      return res.status(400).json({ error: 'No member data provided' });
    }

    for (const m of membersToAdd) {
      if (!m.userId || !mongoose.Types.ObjectId.isValid(m.userId)) {
        return res.status(400).json({
          error: 'Each member must contain a valid userId'
        });
      }

      // prevent duplicate member
      const alreadyExists = group.members.some(
        mem => mem.userId.toString() === m.userId
      );

      if (!alreadyExists) {
        group.members.push({
          userId: m.userId,
          joinedAt: new Date()
        });
      }

      // ensure user → group reference
      await User.findByIdAndUpdate(m.userId, {
        $addToSet: { groups: groupId }
      });
    }

    const updatedGroup = await group.save();

    res.json({
      message: 'Member(s) added to group successfully',
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error adding member to group:', error);
    res.status(500).json({ error: 'Error adding member to group' });
  }
};

/**
 * Remove member from group
 */
const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { members: { userId: memberId } }
      },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove group from user's groups
    await User.findByIdAndUpdate(memberId, {
      $pull: { groups: groupId }
    });

    res.json({
      message: 'Member removed from group successfully',
      data: group
    });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ error: 'Error removing member from group' });
  }
};

/**
 * Update group
 */
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { name, description },
      { new: true }
    ).populate('members.userId', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Error updating group' });
  }
};

/**
 * Delete group
 */
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { isActive: false },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group deleted successfully',
      data: group
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Error deleting group' });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup
};
