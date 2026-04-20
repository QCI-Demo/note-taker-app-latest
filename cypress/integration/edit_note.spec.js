describe("Edit note inline", () => {
  it("saves edited title and restores on cancel", () => {
    cy.visit("/");

    cy.contains("li", "Welcome").within(() => {
      cy.get('[data-testid="edit-note-seed-note-1"]').click();
    });

    cy.get('[data-testid="note-edit-title"]').clear().type("Saved title");
    cy.get('[data-testid="note-edit-save"]').click();

    cy.contains(".note-card__title", "Saved title").should("be.visible");

    cy.contains("li", "Saved title").within(() => {
      cy.get('[data-testid="edit-note-seed-note-1"]').click();
    });

    cy.get('[data-testid="note-edit-title"]').clear().type("Discarded title");
    cy.get('[data-testid="note-edit-cancel"]').click();

    cy.contains(".note-card__title", "Saved title").should("be.visible");
    cy.contains(".note-card__title", "Discarded title").should("not.exist");
  });
});
