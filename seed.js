const mongoose = require('mongoose');
const { User, Group, Expense, Balance, Settlement } = require('./models');

/**
 * Seed sample data for testing
 * Run this file with: node seed.js
 */

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-splitter';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Balance.deleteMany({});
    await Settlement.deleteMany({});

    // Create users
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password_1',
        phone: '+1234567890',
        isActive: true
      },
      {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'hashed_password_2',
        phone: '+1234567891',
        isActive: true
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'hashed_password_3',
        phone: '+1234567892',
        isActive: true
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'hashed_password_4',
        phone: '+1234567893',
        isActive: true
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create group
    const group = new Group({
      name: 'Italy Trip 2025',
      description: 'Summer vacation in Italy',
      members: [
        { userId: users[0]._id, email: users[0].email, joinedAt: new Date() },
        { userId: users[1]._id, email: users[1].email, joinedAt: new Date() },
        { userId: users[2]._id, email: users[2].email, joinedAt: new Date() },
        { userId: users[3]._id, email: users[3].email, joinedAt: new Date() }
      ],
      createdBy: users[0]._id,
      expenses: [],
      isActive: true
    });

    const savedGroup = await group.save();
    console.log('Created group:', savedGroup.name);

    // Update users with group
    for (const user of users) {
      user.groups.push(savedGroup._id);
      await user.save();
    }

    // Create expenses
    const expense1 = new Expense({
      description: 'Restaurant Dinner',
      amount: 120,
      currency: 'USD',
      paidBy: users[0]._id,
      group: savedGroup._id,
      splitType: 'equal',
      splits: [
        { userId: users[1]._id, email: users[1].email, amount: 40 },
        { userId: users[2]._id, email: users[2].email, amount: 40 },
        { userId: users[3]._id, email: users[3].email, amount: 40 }
      ],
      category: 'food',
      date: new Date('2025-01-10'),
      notes: 'Dinner at Italian restaurant'
    });

    const savedExpense1 = await expense1.save();
    console.log('Created expense 1:', savedExpense1.description);

    const expense2 = new Expense({
      description: 'Hotel Booking',
      amount: 300,
      currency: 'USD',
      paidBy: users[1]._id,
      group: savedGroup._id,
      splitType: 'exact',
      splits: [
        { userId: users[0]._id, email: users[0].email, amount: 100 },
        { userId: users[2]._id, email: users[2].email, amount: 100 },
        { userId: users[3]._id, email: users[3].email, amount: 100 }
      ],
      category: 'accommodation',
      date: new Date('2025-01-08'),
      notes: '3-night hotel stay'
    });

    const savedExpense2 = await expense2.save();
    console.log('Created expense 2:', savedExpense2.description);

    const expense3 = new Expense({
      description: 'Gas for Road Trip',
      amount: 80,
      currency: 'USD',
      paidBy: users[2]._id,
      group: savedGroup._id,
      splitType: 'percentage',
      splits: [
        { userId: users[0]._id, email: users[0].email, amount: 24 },
        { userId: users[1]._id, email: users[1].email, amount: 32 },
        { userId: users[3]._id, email: users[3].email, amount: 24 }
      ],
      category: 'transport',
      date: new Date('2025-01-12'),
      notes: 'Road trip fuel'
    });

    const savedExpense3 = await expense3.save();
    console.log('Created expense 3:', savedExpense3.description);

    // Update group with expenses
    savedGroup.expenses.push(savedExpense1._id, savedExpense2._id, savedExpense3._id);
    await savedGroup.save();

    // Create balances
    const balance1 = new Balance({
      group: savedGroup._id,
      user: users[0]._id,
      userEmail: users[0].email,
      owedTo: [
        { userId: users[1]._id, userEmail: users[1].email, amount: 100 }
      ],
      owedBy: [
        { userId: users[1]._id, userEmail: users[1].email, amount: 40 },
        { userId: users[2]._id, userEmail: users[2].email, amount: 40 },
        { userId: users[3]._id, userEmail: users[3].email, amount: 40 }
      ],
      totalOwed: 100,
      totalOwes: 120,
      netBalance: 20
    });

    await balance1.save();
    console.log('Created balance for user 1');

    const balance2 = new Balance({
      group: savedGroup._id,
      user: users[1]._id,
      userEmail: users[1].email,
      owedTo: [
        { userId: users[0]._id, userEmail: users[0].email, amount: 40 }
      ],
      owedBy: [
        { userId: users[0]._id, userEmail: users[0].email, amount: 100 },
        { userId: users[2]._id, userEmail: users[2].email, amount: 32 }
      ],
      totalOwed: 40,
      totalOwes: 132,
      netBalance: 92
    });

    await balance2.save();
    console.log('Created balance for user 2');

    // Create a settlement
    const settlement = new Settlement({
      group: savedGroup._id,
      from: { userId: users[1]._id, email: users[1].email },
      to: { userId: users[0]._id, email: users[0].email },
      amount: 40,
      description: 'Payment for dinner',
      status: 'completed',
      settlementMethod: 'transfer',
      notes: 'Bank transfer via PayPal',
      settledDate: new Date('2025-01-13')
    });

    await settlement.save();
    console.log('Created settlement');

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`
    Created:
    - ${users.length} users
    - 1 group
    - 3 expenses
    - 2 balances
    - 1 settlement
    `);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
