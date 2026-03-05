import Feedback from "../models/Feedback.js";

const crearFeedback = async (req, res) => {
  try {
    const feedback = new Feedback({
      ...req.body,
      userId: req.user._id
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error al crear feedback:', error);
    res.status(500).json({ msg: 'Error al enviar feedback' });
  }
};

const obtenerMisFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    res.status(500).json({ msg: 'Error al obtener feedbacks' });
  }
};

export {
  crearFeedback,
  obtenerMisFeedbacks
};
