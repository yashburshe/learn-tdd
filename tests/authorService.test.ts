import Author, { IAuthor } from "../models/author";
import app from "../server";
import request from "supertest";

describe("Verify GET /authors", () => {

    const mockAuthors = [
        { name: "John, Doe", lifespan: "1990 - 2020" },
        { name: "Jane, Xoe", lifespan: "1995 - 2020" },
        { name: "Alice, Smith", lifespan: "1990 - 2020" }
    ]

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    })

    afterAll(() => {
        consoleSpy.mockRestore();
    })

    it("should return all authors as author name and lifespan", async () => {
        const expectedSortedAuthors = [...mockAuthors].sort((a, b) => a.name.localeCompare(b.name));

        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOpts) => {
            if (sortOpts && sortOpts.family_name === 1) {
                return Promise.resolve(expectedSortedAuthors);
            }
            return Promise.resolve(mockAuthors)
        })

        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(expectedSortedAuthors);

    });

    it("should return message saying no authors found if no authors exist", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue([]);
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.text).toStrictEqual("No authors found");
    });

    it("should respond with an error message when there is an error rocessing the request", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalled();
    });
});