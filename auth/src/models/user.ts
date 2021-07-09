import mongoose from 'mongoose';
import { Password } from '../services/password';

// These interfaces are for TS and Mongoose working with each other well
// 1. The properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// 2. The properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// 3. The properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  // createdAt: string; (more properties on a Doc)
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Only hash the password if it is modified
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
    done();
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
