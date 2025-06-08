import mongoose from 'mongoose';

/**
 * Connect to MongoDB with improved error handling and options
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
const connectMongoDB = async () => {
    try{
        // Check if MongoDB URI is defined
        if (!process.env.MONGO_URI) {throw new Error('MongoDB connection string (MONGO_URI) is not defined in environment variables')}

        // Enhanced connection options for better performance and reliability
        const options = {
            serverSelectionTimeoutMS: 5000, // Maximum time (5 seconds) to select a server before timing out.
            socketTimeoutMS: 45000, // Maximum time (45 seconds) for a session.
        }
        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {console.log(`MongoDB connection error: ${err}`)})
        mongoose.connection.on('disconnected', () => {console.warn('MongoDB disconnected. Attempting to reconnect...')});

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
        console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
        return conn;
    }catch(error){
        console.log(`Error connection to mongoDB : ${error.message}`);
        // More detailed error info for debugging
        if (error.name === 'MongoParseError') {
            console.error('Invalid MongoDB connection string format');
        } else if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any MongoDB server in the connection string');
        }
        // Exit with error in non-development environments
        if (process.env.NODE_ENV !== 'development') {
            process.exit(1);
        }
        throw error;
    }
}

export default connectMongoDB;