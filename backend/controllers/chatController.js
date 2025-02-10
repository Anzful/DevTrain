const Message = require('../models/Message');
const { User } = require('../models/User');

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    console.log('Fetching messages between', currentUserId, 'and', userId);

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .lean();

    console.log('Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const from = req.user.id;

    console.log('Sending message from', from, 'to', to);

    if (!to || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const message = new Message({
      from,
      to,
      content,
      createdAt: new Date()
    });

    const savedMessage = await message.save();
    console.log('Message saved:', savedMessage);

    // Get the populated message
    const populatedMessage = await Message.findById(savedMessage._id)
      .lean();

    // Emit to socket if recipient is connected
    if (req.io) {
      const recipientSocketId = req.app.get('connectedUsers')?.get(to);
      if (recipientSocketId) {
        req.io.to(recipientSocketId).emit('message', populatedMessage);
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Error sending message',
      error: error.message 
    });
  }
}; 