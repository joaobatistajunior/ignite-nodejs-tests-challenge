import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"


let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("User Profile", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be get user profile", async() => {
    const newUser: ICreateUserDTO = {
      email: "email_profile@email.com",
      password: "123456",
      name: "user name profile"
    }
    const user = await createUserUseCase.execute(newUser);
    const user_id = user.id as string;

    const profile = await showUserProfileUseCase.execute(user_id);

    expect(profile).toHaveProperty("id");
    expect(profile).toHaveProperty("email");
    expect(profile).toHaveProperty("name");
    expect(profile).toHaveProperty("password");
  });

  it("should not be get user profile with a invalid user id", () => {
    expect(async() => {
      await showUserProfileUseCase.execute("invalid_user_id_profile");
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })

})
