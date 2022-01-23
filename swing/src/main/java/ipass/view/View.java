package ipass.view;

import ipass.util.GuiWrapper;

import javax.swing.*;

public class View {

    private final GuiWrapper gui;
    private final JLabel label;
    private final JPasswordField passwordField;
    private final JButton showBtn;
    private final JButton accListBtn;
    private JScrollPane accListPane;
    private JTextArea accListArea;

    public View(String title) {
        gui = new GuiWrapper(title, 200, 100);
        label = gui.addLabel("Set master password!", -1, 10);
        passwordField = gui.addPwdField(10, -1, 30);
        showBtn = gui.addButton("Show", 20, 55);
        accListBtn = gui.addButton("Notes", 100, 55);
        accListPane = gui.addTextArea("", -1, 85, 180, 80);
        accListArea = (JTextArea) accListPane.getViewport().getView();
        showBtn.setVisible(false);
        accListBtn.setVisible(false);
        accListPane.setVisible(false);
    }

    public GuiWrapper getGui() {
        return gui;
    }

    public JLabel getLabel() {
        return label;
    }

    public JPasswordField getPasswordField() {
        return passwordField;
    }

    public JButton getShowBtn() {
        return showBtn;
    }

    public JButton getAccListBtn() {
        return accListBtn;
    }

    public JScrollPane getAccListPane() {
        return accListPane;
    }

    public void setAccListPane(JScrollPane accListPane) {
        this.accListPane = accListPane;
    }

    public JTextArea getAccListArea() {
        return accListArea;
    }

    public void setAccListArea(JTextArea accListArea) {
        this.accListArea = accListArea;
    }
}
