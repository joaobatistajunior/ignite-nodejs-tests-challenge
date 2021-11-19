import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Authenticate User", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate a user", async() => {
    const {email, name, password} =  {
      email: "email@email.com",
      name: "user name",
      password: "123456"
    };

    await createUserUseCase.execute({email, name, password});

    const auth = await authenticateUserUseCase.execute({email, password});

    expect(auth).toHaveProperty("token");
  });


  it("should not be able to authenticate an non-existent user", () => {
    expect(async() => {
      const {email, name, password} = {
        email: "valid@email.com",
        password: "valid_password",
        name: "valid user name"
      };

      await createUserUseCase.execute({name, email, password});

      await authenticateUserUseCase.execute({email: "invalid@email.com", password});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect password", () => {
    expect(async() => {
      const {email, name, password} = {
        email: "valid@email.com",
        password: "valid_password",
        name: "valid user name"
      };

      await createUserUseCase.execute({name, email, password});

      await authenticateUserUseCase.execute({email, password: "invalid_password"});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
