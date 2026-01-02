const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Question = require('./models/Question');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ncert_gamified';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await Topic.deleteMany({});
        await Question.deleteMany({});

        // Sample Data for Class 6 Science
        const t1 = await Topic.create({
            class: 6,
            subject: 'Science',
            name: 'Food: Where Does It Come From?',
            theory: 'All living organisms need food to survive. Plants make their own food, while animals depend on plants or other animals...',
            order: 1
        });

        const questions = [
            {
                topicId: t1._id,
                questionText: 'Which part of a plant is a ginger?',
                options: ['Root', 'Stem', 'Leaf', 'Fruit'],
                correctAnswer: 1,
                explanation: 'Ginger is a modified stem.'
            },
            {
                topicId: t1._id,
                questionText: 'Animals that eat only plants are called?',
                options: ['Carnivores', 'Herbivores', 'Omnivores', 'Decomposers'],
                correctAnswer: 1,
                explanation: 'Herbivores eat only plants.'
            },
            // Add more questions to make it 8
            { topicId: t1._id, questionText: 'Bees collect nectar from?', options: ['Leaves', 'Flowers', 'Roots', 'Stems'], correctAnswer: 1 },
            { topicId: t1._id, questionText: 'We get sugar from?', options: ['Sugar beet', 'Sugarcane', 'Both a and b', 'None'], correctAnswer: 2 },
            { topicId: t1._id, questionText: 'Lion is a?', options: ['Herbivore', 'Carnivore', 'Omnivore', 'None'], correctAnswer: 1 },
            { topicId: t1._id, questionText: 'Human being is a?', options: ['Herbivore', 'Carnivore', 'Omnivore', 'None'], correctAnswer: 2 },
            { topicId: t1._id, questionText: 'Butter is a?', options: ['Plant product', 'Animal product', 'Both', 'None'], correctAnswer: 1 },
            { topicId: t1._id, questionText: 'Which is a cereal?', options: ['Wheat', 'Gram', 'Pea', 'Bean'], correctAnswer: 0 }
        ];

        await Question.insertMany(questions);

        // Sample Data for Class 6 Maths
        const t2 = await Topic.create({
            class: 6,
            subject: 'Maths',
            name: 'Knowing Our Numbers',
            theory: 'Numbers are used to count, measure and label things. We use the decimal system with digits 0-9. Understanding place value is key!',
            order: 2
        });

        const mathQuestions = [
            {
                topicId: t2._id,
                questionText: 'What is the largest 3-digit number?',
                options: ['999', '100', '900', '990'],
                correctAnswer: 0,
                explanation: '999 is the largest 3-digit number before 1000.'
            },
            {
                topicId: t2._id,
                questionText: 'Which of these is the smallest number?',
                options: ['123', '231', '312', '132'],
                correctAnswer: 0,
                explanation: '123 is less than all other options.'
            },
            { topicId: t2._id, questionText: 'Expanded form of 123 is?', options: ['10+20+3', '100+20+3', '1+2+3', 'None'], correctAnswer: 1 },
            { topicId: t2._id, questionText: '1 Million is equal to?', options: ['1 Lakh', '10 Lakh', '100 Lakh', '1 Crore'], correctAnswer: 1 },
            { topicId: t2._id, questionText: 'Roman numeral for 50 is?', options: ['X', 'L', 'C', 'D'], correctAnswer: 1 },
            { topicId: t2._id, questionText: 'Number of zeroes in 1 Crore?', options: ['5', '6', '7', '8'], correctAnswer: 2 },
            { topicId: t2._id, questionText: 'Predictor of 100 is?', options: ['99', '101', '100', 'None'], correctAnswer: 0 },
            { topicId: t2._id, questionText: 'Rounding 48 to nearest 10?', options: ['40', '50', '45', '100'], correctAnswer: 1 }
        ];

        await Question.insertMany(mathQuestions);

        console.log('Seed data inserted successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
