import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create user", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async() => {
    const user = await createUserUseCase.execute({
      email: "email@email.com",
      name: "user name",
      password: "123456"
    });
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user if already exists", async() => {

    expect(async() => {
      await createUserUseCase.execute({
        email: "email@email.com",
        name: "user name",
        password: "123456"
      });
      await createUserUseCase.execute({
        email: "email@email.com",
        name: "user name",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

})
