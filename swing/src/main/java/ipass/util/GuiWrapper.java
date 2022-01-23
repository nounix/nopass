package ipass.util;

import javax.swing.*;

public class GuiWrapper {

    private final JFrame frame;

    public GuiWrapper(String title, int x, int y) {
        frame = new JFrame();
        frame.setTitle(title);
        frame.setSize(x, y);
        frame.setLayout(null);
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public JFrame getFrame() {
        return frame;
    }

    public void switchVisible() {
        if (frame.isVisible()) frame.setVisible(false);
        else frame.setVisible(true);
    }

    public void alignCenter(Object obj) {
        String className = obj.getClass().getSimpleName();

        if (className.equals("JLabel")) {
            JLabel label = (JLabel) obj;
            int w = SwingUtilities.computeStringWidth(label.getFontMetrics(label.getFont()), label.getText());
            int x = (frame.getWidth() / 2) - (w / 2);
            label.setBounds(x, label.getY(), w, label.getHeight());
        }
    }

    public JLabel addLabel(String title, int x, int y) {
        JLabel label = new JLabel(title);
        int labelWidth = SwingUtilities.computeStringWidth(label.getFontMetrics(label.getFont()), label.getText());
        if (x == -1) x = (frame.getWidth() / 2) - (labelWidth / 2);
        label.setBounds(x, y, labelWidth, 15);
        frame.add(label);
        return label;
    }

    public JButton addButton(String title, int x, int y) {
        JButton button = new JButton(title);
        button.setBounds(x, y, ((title.length() + 4) * 10), 20);
        frame.add(button);
        return button;
    }

    public JButton addButton(String title, int x, int y, Runnable fnc) {
        JButton button = addButton(title, x, y);
        button.addActionListener(event -> fnc.run());
        return button;
    }

    public JPasswordField addPwdField(int col, int x, int y) {
        JPasswordField pwdField = new JPasswordField(col) {
            public void addNotify() {
                super.addNotify();
                requestFocusInWindow();
            }
        };
        if (x == -1) x = (frame.getWidth() / 2) - (col * 4);
        pwdField.setBounds(x, y, (col * 8), 20);
        frame.add(pwdField);
        return pwdField;
    }

    public JPasswordField addPwdField(int col, int x, int y, Runnable fnc) {
        JPasswordField pwdField = addPwdField(col, x, y);
        pwdField.addActionListener(event -> fnc.run());
        return pwdField;
    }

    public JScrollPane addTextArea(String txt, int x, int y, int w, int h) {
        JTextArea textArea = new JTextArea(txt);
        textArea.setBounds(0, 0, w, h);
        JScrollPane scrollPane = new JScrollPane(textArea, JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED, JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        if (x == -1) x = (frame.getWidth() / 2) - (w / 2);
        scrollPane.setBounds(x, y, w, h);
        frame.add(scrollPane);
        return scrollPane;
    }
}