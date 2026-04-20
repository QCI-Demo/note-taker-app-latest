describe("Edit note flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("edits a note, saves, and shows updated title", () => {
    cy.get('[data-testid="add-note-button"]').click();
    const originalTitle = "Note to edit";
    const originalBody = "Body before edit.";
    cy.get("#create-note-title").clear().type(originalTitle);
    cy.get("#create-note-body").clear().type(originalBody);
    cy.get('[data-testid="create-note-submit"]').click();

    cy.contains('[data-testid="note-list"] li', originalTitle).should(
      "be.visible",
    );

    cy.contains('[data-testid="note-list"] li', originalTitle)
      .find('[data-testid="note-edit-open"]')
      .click();

    const newTitle = "Updated Cypress Title";
    cy.get('[data-testid="note-edit-inline"]')
      .find('[aria-label="Note title"]')
      .clear()
      .type(newTitle);
    cy.get('[data-testid="note-edit-save"]').click();

    cy.contains('[data-testid="note-list"] li', newTitle).should("be.visible");
    cy.contains('[data-testid="note-list"] li', originalTitle).should(
      "not.exist",
    );
  });

  it("cancels edit and keeps original title", () => {
    cy.get('[data-testid="add-note-button"]').click();
    const originalTitle = "Cancel me";
    cy.get("#create-note-title").clear().type(originalTitle);
    cy.get("#create-note-body").clear().type("Body.");
    cy.get('[data-testid="create-note-submit"]').click();

    cy.contains('[data-testid="note-list"] li', originalTitle)
      .find('[data-testid="note-edit-open"]')
      .click();

    cy.get('[data-testid="note-edit-inline"]')
      .find('[aria-label="Note title"]')
      .clear()
      .type("This should not stick");
    cy.get('[data-testid="note-edit-cancel"]').click();

    cy.contains('[data-testid="note-list"] li', originalTitle).should(
      "be.visible",
    );
    cy.contains('[data-testid="note-list"] li', "This should not stick").should(
      "not.exist",
    );
  });
});
