jest.mock("mongoose", () => ({
  connect: jest.fn().mockResolvedValue(true),
  Schema: jest.fn(),
  model: jest.fn().mockReturnValue({}),
}));

beforeEach(() => {
  require("mongoose").connect.mockClear();
});
