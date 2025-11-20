import mongoose, { Schema } from "mongoose";

const categoriesSchema = new Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  photo: {
      data: Buffer,
      contentType: String,
    },
});

const Categories = mongoose.model("Categories", categoriesSchema);

export default Categories;
